#!/bin/bash

#paths

BASE_DIR="/opt/csye6225"
APP_DIR="$BASE_DIR/webapp"
LOG_FILE="/var/log/csye6225_setup.log"
LINUX_GROUP="csye6225_cloud"
LINUX_USER="rohith"
ZIP_FILE="/tmp/webapp"

#log enable
exec > >(tee -a "$LOG_FILE") 2>&1

#update and upgrade

sudo apt update
sudo apt upgrade -y

#install postgres 

echo "INSTALLING POSTGRES..."

sudo apt install -y postgresql postgresql-contrib unzip npm

echo "POSTGRES IS INSTALLED"

#enabling postgres service

sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl restart postgresql

#configuring postgres

#database name
read -p "Enter database name: " DB_NAME
if [ -z "$DB_NAME" ]; then
  echo "Please enter the database name"
  exit 1
fi

#database user
read -p "Enter database user: " DB_USER
if [ -z "$DB_USER" ]; then
  echo "Please enter the database user"
  exit 1
fi

#database password
read -sp "Enter database password: " DB_PASSWORD
echo
if [ -z "$DB_PASSWORD" ]; then
  echo "Please enter the password"
  exit 1
fi

echo "CONFIGURING DATABASE"

sudo -u postgres psql <<EOF
ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
EOF
#creating linux group and user

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

# installing Node.js

sudo apt install -y nodejs

#install Dependencies

echo "INSTALL DEPENDENCIES"

if [ -f "$APP_DIR/package.json" ]; then
    cd "$APP_DIR"
    sudo -u $LINUX_USER npm install
else
    echo "❌ ERROR: package.json not found in $APP_DIR."
    exit 1
fi

#starting node.js server

echo "ALMOST THERE! RUNNING THE SERVER"

exec sudo -u $LINUX_USER node server.js
