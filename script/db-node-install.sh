#!/bin/bash
set -e 

# Update package lists first
echo "UPDATING PACKAGE LISTS..."
sudo apt-get update

# Install postgres 
echo "INSTALLING POSTGRES..."
sudo apt-get install -y postgresql postgresql-contrib unzip npm

echo "POSTGRES IS INSTALLED"

# Enabling postgres service
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl restart postgresql

if [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  echo "Error: Missing required database variables!"
  exit 1
fi

echo "CONFIGURING DATABASE"

sudo -u postgres psql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
EOF