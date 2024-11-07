{ stdenv, pkgs, fetchurl, lib, cask, ... }:
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
