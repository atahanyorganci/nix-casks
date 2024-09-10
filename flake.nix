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
    in
    {
      formatter = eachSystem (pkgs: pkgs.nixpkgs-fmt);
      packages = eachDarwinSystem (pkgs: rec {
        vlc = pkgs.callPackage ./packages/vlc { };
        whatsapp = pkgs.callPackage ./packages/whatsapp { };
      });
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
