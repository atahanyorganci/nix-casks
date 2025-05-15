{ stdenv, pkgs, fetchurl, lib, pkg, ... }:
stdenv.mkDerivation rec {
  inherit (pkg) pname version;
  nativeBuildInputs = with pkgs; [
    magika
    unzip
    jq
  ];
  phases = [ "unpackPhase" "installPhase" ];
  unpackPhase = builtins.readFile ./unpack.sh;
  installPhase = builtins.concatStringsSep "\n" pkg.installPhase;
  src = fetchurl pkg.src;
  meta = with stdenv.lib; {
    inherit (pkg.meta) description homepage;
    platforms = lib.platforms.darwin;
  };
}
