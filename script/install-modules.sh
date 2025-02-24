#!bin/bash

APP_DIR="$BASE_DIR/webapp"
LINUX_USER="rohith"

echo "INSTALL DEPENDENCIES"

if [ -f "$APP_DIR/package.json" ]; then
    cd "$APP_DIR"
    sudo -u $LINUX_USER npm install
else
    echo "❌ ERROR: package.json not found in $APP_DIR."
    exit 1
fi

echo "ALMOST THERE! NOW YOU CAN ADD THE SERVICE"