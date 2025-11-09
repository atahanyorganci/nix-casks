{
  perSystem = { pkgs, ... }:
    let
      packageJson = builtins.fromJSON (builtins.readFile ../package.json);
      packageManager = builtins.elemAt (builtins.split "\\+" packageJson.packageManager) 0;
      pnpm-shim = pkgs.writeShellScriptBin "pnpm" ''
        exec ${pkgs.nodejs-slim}/bin/node ${pkgs.nodejs-slim}/bin/corepack pnpm "$@"
      '';
    in
    {
      devShells.default = pkgs.mkShell {
        shellHook = ''
          corepack install -g ${packageManager}
        '';
        buildInputs = with pkgs; [
          pnpm-shim
          nodejs-slim
          just
          process-compose
          curl
          git
          ngrok
          magika
          flyctl
        ];
      };
    };
}
