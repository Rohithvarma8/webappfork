#!/bin/bash
set -e

#web get method.... this will get the amazon cloudwatch from aws

echo "installing cloudwatch"

wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start

echo "installed cloudwatch"


