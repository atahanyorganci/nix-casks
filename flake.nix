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
      devShells = eachSystem (pkgs:
        let
          archive = "./archive.json";
          endpoint = "https://nix-casks.yorganci.dev/api/archive/latest";
          ci = pkgs.writeShellScriptBin "ci" ''
            set -e
            curl -o "${archive}" -L --retry 5 --retry-delay 2 --fail "${endpoint}"
          '';
          packageJson = builtins.fromJSON (builtins.readFile ./package.json);
          packageManager = builtins.elemAt (builtins.split "\\+" packageJson.packageManager) 0;
          pnpm-shim = pkgs.writeShellScriptBin "pnpm" ''
            exec ${pkgs.nodejs-slim}/bin/node ${pkgs.nodejs-slim}/bin/corepack pnpm "$@"
          '';
        in
        {
          default = pkgs.mkShell {
            shellHook = ''
              corepack install -g ${packageManager}
            '';
            buildInputs = with pkgs; [
              pnpm-shim
              nodejs-slim
              curl
              git
              ngrok
              ci
            ];
          };
        });
    };
}
