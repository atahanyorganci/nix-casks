{
  description = "Nix flake port of Homebrew casks";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
  };
  outputs = { nixpkgs, ... }:
    let
      systems = nixpkgs.lib.platforms.all;
      eachSystem = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
      darwin = nixpkgs.lib.platforms.darwin;
      eachDarwinSystem = f: nixpkgs.lib.genAttrs darwin (system: f nixpkgs.legacyPackages.${system});
      eachCask = f:
        let
          casks = builtins.readDir ./packages/casks;
          fileNames = builtins.attrNames casks;
          fileStems = builtins.map (name: builtins.substring 0 (builtins.stringLength name - 5) name) fileNames;
        in
        nixpkgs.lib.genAttrs fileStems (name: f (builtins.fromJSON (builtins.readFile ./packages/casks/${name}.json)));
    in
    {
      formatter = eachSystem (pkgs: pkgs.nixpkgs-fmt);
      packages = eachDarwinSystem (pkgs: eachCask (cask: (pkgs.callPackage ./packages { inherit cask; })));
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
          ];
        };
      });
    };
}
