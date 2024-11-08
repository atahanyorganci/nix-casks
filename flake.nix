{
  description = "Nix flake port of Homebrew casks";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };
  outputs = { nixpkgs, ... }:
    let
      systems = nixpkgs.lib.platforms.all;
      eachSystem = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
      darwin = nixpkgs.lib.platforms.darwin;
      eachDarwinSystem = f: nixpkgs.lib.genAttrs darwin (system: f nixpkgs.legacyPackages.${system});
    in
    {
      formatter = eachSystem (pkgs: pkgs.nixpkgs-fmt);
      packages = eachDarwinSystem (pkgs:
        let
          source = pkgs.fetchurl {
            name = "packages.json";
            url = "http://localhost:4321/api/package";
            sha256 = "0lzsj5dcylj4f7p6mcdzcp17afy8v7rhndzj2qc50c3n7yym6zjq";
          };
          json = builtins.fromJSON (builtins.readFile source);
          packages = builtins.listToAttrs (map
            (pkg: {
              name = pkg.pname;
              value = pkgs.callPackage ./packages { inherit pkg; };
            })
            json);
        in
        packages);
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          shellHook = ''
            export COREPACK_DIR=$HOME/.local/share/corepack
            mkdir -p $COREPACK_DIR
            corepack enable --install-directory $COREPACK_DIR
            PATH=$COREPACK_DIR:$PATH
          '';
          buildInputs = with pkgs; [
            nodejs_20
            python312Packages.magika
            nodePackages.vercel
          ];
        };
      });
    };
}
