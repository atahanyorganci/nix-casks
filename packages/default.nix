{ stdenv, pkgs, fetchurl, lib, cask, ... }:
let
  installDmg = ''
    mnt=$(mktemp -d -t ci-XXXXXXXXXX)

    function finish {
      echo "Detaching $mnt"
      /usr/bin/hdiutil detach $mnt -force
      rm -rf $mnt
    }
    trap finish EXIT

    echo "Attaching $mnt"
    /usr/bin/hdiutil attach -nobrowse -readonly $src -mountpoint $mnt

    echo "Contents of $mnt"
    ls -la $mnt/

    echo "Copying contents"
    shopt -s extglob
    DEST="$PWD"
    (cd "$mnt"; cp -a !(Applications) "$DEST/")
    echo "Contents copied to $DEST"
  '';
  installZip = ''
    tmp=$(mktemp -d -t ci-XXXXXXXXXX)
    unzip -d $tmp $src
    DEST="$PWD"
    cd $tmp && cp -a . "$DEST" && cd $DEST
  '';
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
  nativeBuildInputs = with pkgs; [ file unzip undmg ];
  unpackPhase =
    if lib.strings.hasSuffix ".dmg" cask.src.name then installDmg
    else if lib.strings.hasSuffix ".zip" cask.src.name then installZip
    else
      ''
        type=$(file -b --mime-type $src)
        if [ "$type" = "application/zip" ]; then
          ${installZip}
        else
          echo "Unsupported file type: $type"
          exit 1
        fi
      '';
  installPhase = ''
    ${installScript}
    echo '${installScript}' > $out/install.sh
  '';
  src = fetchurl cask.src;
  meta = with stdenv.lib; {
    inherit (cask.meta) description homepage;
    platforms = lib.platforms.darwin;
  };
}
