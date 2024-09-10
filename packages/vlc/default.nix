{ stdenv, pkgs, fetchurl, lib, ... }:
let
  cask = builtins.fromJSON (builtins.readFile ./cask.json);
  appArtifact = (builtins.elemAt (builtins.filter (entry: builtins.hasAttr "app" entry) cask.artifacts) 0).app;
  app = builtins.elemAt appArtifact 0;
  file = "${pkgs.file}/bin/file";
in
stdenv.mkDerivation rec {
  pname = cask.token;
  version = cask.version;
  buildInputs = with pkgs; [ unzip undmg ];
  phases = [ "unpackPhase" "installPhase" ];
  unpackPhase = ''
    mkdir -p $out/Applications
    type=$(${file} -b --mime-type $src)
    if [ "$type" = "application/zip" ]; then
      unzip -d $out/Applications $src
    elif [ "$type" = "application/x-apple-diskimage" ] || [ "$type" = "application/x-bzip2" ]; then
      undmg $src
      cp -r ${app} $out/Applications
    else
      echo "Unsupported file type: $type"
      exit 1
    fi
  '';
  src = fetchurl {
    inherit (cask) url sha256;
    name = "${pname}-${version}";
  };
  meta = with stdenv.lib; {
    description = cask.desc;
    homepage = cask.homepage;
    platforms = lib.platforms.darwin;
  };
}
