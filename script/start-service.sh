#!/bin/bash
set -e

echo "Setting up systemd service for the Node.js application..."

# Create the systemd service file directly via heredoc.
sudo tee /etc/systemd/system/healthz.service > /dev/null <<'EOF'
[Unit]
Description=Healthz Node.js Application
After=network.target postgresql.service

[Service]
User=rohith
Group=csye6225_cloud
WorkingDirectory=/opt/csye6225
ExecStart=/usr/bin/node /opt/csye6225/server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Daemon is reloading..."
sudo systemctl daemon-reload

echo "Healthz service is being enabled..."
sudo systemctl enable healthz.service

echo "Healthz service is starting..."
sudo systemctl start healthz.service

echo "Completed service setup"