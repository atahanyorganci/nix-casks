shopt -s extglob
DEST="$PWD"
TEMP=$(mktemp -d -t ci-XXXXXXXXXX)
MOUNTED=0

function cleanup {
    echo "Cleaning up $TEMP"
    if [ $MOUNTED -eq 1 ]; then
        echo "Detaching $TEMP"
        /usr/bin/hdiutil detach "$TEMP" -force
    fi
    rm -rf "$TEMP"
}

trap cleanup EXIT

FILE_NAME=$(basename "$src")

OUTPUT=$(magika-python-client --json --mime-type "$src" | jq -r '.[0].prediction.output')
MIME_TYPE=$(echo "$OUTPUT" | jq -r '.mime_type')
DESCRIPTION=$(echo "$OUTPUT" | jq -r '.description')

echo "File $FILE_NAME is $DESCRIPTION ($MIME_TYPE)"

if [ "$MIME_TYPE" = "application/zip" ]; then
    echo "Unzipping $src to $DEST"
    unzip -d "$TEMP" "$src"
    echo "Contents of $TEMP:"
    ls -l "$TEMP"
    echo "Copying $TEMP to $DEST"
    cd "$TEMP" && cp -a . "$DEST" && cd "$DEST" || exit 1
elif [ "$MIME_TYPE" = "application/x-apple-diskimage" ]; then
    echo "Attaching $TEMP"
    echo "Y" | /usr/bin/hdiutil attach -nobrowse -readonly "$src" -mountpoint "$TEMP"
    MOUNTED=1
    echo "Contents of $TEMP:"
    ls -l "$TEMP"
    echo "Copying $TEMP to $DEST"
    cd "$TEMP" && cp -a !(Applications) "$DEST/" || exit 1
elif [ "$MIME_TYPE" = "application/x-bzip2" ]; then
    echo "Unpacking $src to $DEST"
    tar -xjf "$src" -C "$TEMP"
    echo "Contents of $TEMP:"
    ls -l "$TEMP"
    echo "Copying $TEMP to $DEST"
    cd "$TEMP" && cp -a . "$DEST" && cd "$DEST" || exit 1
else
    echo "Unknown type $TYPE"
    exit 1
fi
