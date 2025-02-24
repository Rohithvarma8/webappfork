#!bin/bash

BASE_DIR="/opt/csye6225"
LINUX_GROUP="csye6225_cloud"
LINUX_USER="rohith"
ZIP_FILE="/tmp/webapp"

if [ ! -f "../webapp.zip" ]; then
  echo "Error: webapp.zip not found!"
  exit 1
fi


echo "CREATING USER AND GROUP"

sudo groupadd -f $LINUX_GROUP
sudo useradd -m -g $LINUX_GROUP -s /bin/bash $LINUX_USER

#Unzip the applications to /opt/csye6225

sudo mkdir -p "$BASE_DIR"
sudo unzip -o "$ZIP_FILE" -d "$BASE_DIR"

#setting permissions

echo "CHANGING PERMISSIONS AND OWNERSHIP"

sudo chown -R $LINUX_USER:$LINUX_GROUP "$BASE_DIR"
sudo chmod -R 750 "$BASE_DIR"
