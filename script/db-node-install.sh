#!/bin/bash
set -e 

# Update package lists first
echo "UPDATING PACKAGE LISTS..."
sudo apt-get update


sudo apt-get install -y unzip npm



if [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  echo "Error: Missing required database variables!"
  exit 1
fi
