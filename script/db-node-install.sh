#!bin/bash


#install postgres 
echo "INSTALLING POSTGRES..."

sudo apt install -y postgresql postgresql-contrib unzip npm

echo "POSTGRES IS INSTALLED"

#enabling postgres service

sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl restart postgresql

if [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER"]; then
  echo "Error: Missing required database variables!"
  exit 1
fi

echo "CONFIGURING DATABASE"

sudo -u postgres psql <<EOF
ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
EOF

