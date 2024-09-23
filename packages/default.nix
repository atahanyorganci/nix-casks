{ stdenv, pkgs, fetchurl, lib, cask, ... }:
let
  artifact = (builtins.elemAt (builtins.filter (entry: entry.type == "app") cask.artifacts) 0).value;
  appCopy = artifact: ''
    mkdir -p "$out/Applications" && cp -r "${artifact.name}" "$out/Applications/${artifact.target or artifact.name}"
  '';
  binaryLink = binary:
    let
      src = builtins.replaceStrings [ "$APPDIR" ] [ "$out/Applications" ] "${binary}";
      parts = lib.splitString "/" binary;
      name = builtins.elemAt parts (builtins.length parts - 1);
    in
    ''
      mkdir -p "$out/bin" && ln -s "${src}" "$out/bin/${name}"
    '';
  installScript = builtins.concatStringsSep "\n" (builtins.map ({ type, value }: if type == "app" then (appCopy value) else if type == "binary" then (binaryLink value) else "") cask.artifacts);
in
stdenv.mkDerivation rec {
  inherit (cask) pname version;
  nativeBuildInputs = with pkgs; [
    python312Packages.magika
    unzip
    jq
  ];
  phases = [ "unpackPhase" "installPhase" ];
  unpackPhase = builtins.readFile ./unpack.sh;
  installPhase = builtins.concatStringsSep "\n" cask.installPhase;
  src = fetchurl cask.src;
  meta = with stdenv.lib; {
    inherit (cask.meta) description homepage;
    platforms = lib.platforms.darwin;
  };
}
