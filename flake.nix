{
  description = "Nix flake port of Homebrew casks";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };
  outputs = { nixpkgs, ... }:
    let
      systems = nixpkgs.lib.platforms.all;
      eachSystem = f: nixpkgs.lib.genAttrs systems (system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config = {
              allowUnfree = true;
            };
          };
        in
        f pkgs
      );
      darwin = nixpkgs.lib.platforms.darwin;
      eachDarwinSystem = f: nixpkgs.lib.genAttrs darwin (system: f nixpkgs.legacyPackages.${system});
    in
    {
      formatter = eachSystem (pkgs: pkgs.nixpkgs-fmt);
      packages = eachDarwinSystem (pkgs:
        let
          archive = builtins.fromJSON (builtins.readFile ./archive.json);
          source = pkgs.fetchurl {
            inherit (archive) url sha256;
            name = "packages.json";
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
            ngrok
            nodejs_20
            python312Packages.magika
            nodePackages.vercel
          ];
        };
      });
    };
}
