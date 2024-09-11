{ stdenv, pkgs, fetchurl, lib, cask, ... }:
let
  artifact = (builtins.elemAt (builtins.filter (entry: entry.type == "app") cask.artifacts) 0).value;
in
stdenv.mkDerivation rec {
  inherit (cask) pname version;
  buildInputs = with pkgs; [ file unzip undmg ];
  phases = [ "unpackPhase" "installPhase" ];
  unpackPhase = ''
    mkdir -p $out/Applications
    type=$(file -b --mime-type $src)
    if [ "$type" = "application/zip" ]; then
      unzip -d $out/Applications $src
    elif [ "$type" = "application/x-apple-diskimage" ] || [ "$type" = "application/x-bzip2" ]; then
      undmg $src
      cp -r ${artifact.name} $out/Applications/${artifact.target or artifact.name}
    else
      echo "Unsupported file type: $type"
      exit 1
    fi
  '';
  src = fetchurl {
    inherit (cask.src) url sha256;
    name = "${pname}-${version}";
  };
  meta = with stdenv.lib; {
    inherit (cask.meta) description homepage;
    platforms = lib.platforms.darwin;
  };
}
