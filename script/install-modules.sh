#!/bin/bash
set -e 

BASE_DIR="/opt/csye6225"
APP_DIR="$BASE_DIR/webapp"
LINUX_USER="rohith"
LINUX_GROUP="csye6225_cloud"

echo "INSTALL DEPENDENCIES"

echo "Contents of $BASE_DIR:"
sudo ls -la "$BASE_DIR"

echo "Contents of $APP_DIR (if exists):"
sudo ls -la "$APP_DIR" || echo "webapp directory not found or empty"

# Create .env file
echo "CREATING .ENV FILE"
sudo bash -c "cat > $APP_DIR/.env << EOF
PORT=${PORT}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
EOF"

# Set proper permissions for .env file
sudo chown $LINUX_USER:$LINUX_GROUP "$APP_DIR/.env"
sudo chmod 640 "$APP_DIR/.env"

echo "Checking for package.json in $APP_DIR"
if sudo test -f "$APP_DIR/package.json"; then
    echo "Found package.json, installing dependencies..."
    
    # Instead of changing directory, use absolute paths
    # and run the entire npm command as the rohith user
    sudo -u $LINUX_USER bash -c "cd $APP_DIR && npm install"
else
    echo "❌ ERROR: package.json not found in $APP_DIR."
    exit 1
fi

echo "ALMOST THERE! NOW YOU CAN ADD THE SERVICE"