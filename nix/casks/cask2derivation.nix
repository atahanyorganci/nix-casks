{ stdenv
, pkgs
, fetchurl
, lib
, cask
, ...
}:
stdenv.mkDerivation rec {
  inherit (cask) pname version;
  nativeBuildInputs = with pkgs; [
    magika
    unzip
    jq
    bzip2
  ];
  phases = [ "unpackPhase" "installPhase" ];
  unpackPhase = builtins.readFile ./unpack.sh;
  installPhase = builtins.concatStringsSep "\n" cask.installPhase;
  src = fetchurl {
    inherit (cask.src) url sha256;
    name = cask.pname;
  };
  meta = with stdenv.lib; {
    inherit (cask.meta) description homepage;
    platforms = lib.platforms.darwin;
  };
}
