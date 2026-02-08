{
  perSystem = { pkgs, ... }:
    with pkgs;
    let
      archive = builtins.fromJSON (builtins.readFile ../../archive.json);
      packagesJsonSrc = pkgs.fetchurl {
        inherit (archive) url sha256;
        name = "packages.json";
      };
      packagesJson = builtins.fromJSON (builtins.readFile packagesJsonSrc);
      packages = builtins.listToAttrs (map
        (cask: {
          name = cask.pname;
          value = pkgs.callPackage ./cask2derivation.nix { inherit cask; };
        })
        packagesJson);
    in
    {
      packages = lib.mkIf (lib.hasSuffix "darwin" stdenv.hostPlatform.system) packages;
    };
}
