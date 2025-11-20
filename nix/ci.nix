{
  perSystem = { pkgs, ... }:
    let
      archivePath = "./archive.json";
      endpoint = "https://nix-casks.yorganci.dev/api/archive/latest";
      curl = "${pkgs.curl}/bin/curl";
    in
    {
      packages = {
        ci = pkgs.writeShellScriptBin "ci" ''
          set -euo pipefail

          ${curl} -o "${archivePath}" -L --retry 5 --retry-delay 2 --fail "${endpoint}"
        '';
      };
    };
}
