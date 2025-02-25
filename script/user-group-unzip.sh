#!/bin/bash
set -e 

BASE_DIR="/opt/csye6225"
LINUX_GROUP="csye6225_cloud"
LINUX_USER="rohith"
ZIP_FILE="/tmp/webapp.zip"

if [ ! -f "$ZIP_FILE" ]; then
  echo "Error: $ZIP_FILE not found!"
  ls -la /tmp/
  exit 1
fi

echo "CREATING USER AND GROUP"

sudo groupadd -f $LINUX_GROUP
sudo useradd -m -g $LINUX_GROUP -s /bin/bash $LINUX_USER

# Unzip the applications to /opt/csye6225
echo "UNZIPPING APPLICATION"
sudo mkdir -p "$BASE_DIR"
sudo unzip -o "$ZIP_FILE" -d "$BASE_DIR"
mkdir -p "$BASE_DIR/webapp"
mv "$BASE_DIR"/* "$BASE_DIR/webapp/"


# Remove Mac OS X metadata directory if it exists
sudo rm -rf "$BASE_DIR/__MACOSX"

# List the contents to verify
echo "Contents of $BASE_DIR:"
ls -la "$BASE_DIR"
echo "Contents of $BASE_DIR/webapp (if exists):"
ls -la "$BASE_DIR/webapp" || echo "webapp directory not found"

# Setting permissions
echo "CHANGING PERMISSIONS AND OWNERSHIP"
sudo chown -R $LINUX_USER:$LINUX_GROUP "$BASE_DIR"
sudo chmod -R 750 "$BASE_DIR"