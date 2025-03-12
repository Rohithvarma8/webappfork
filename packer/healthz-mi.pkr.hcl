packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0, < 2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
    googlecompute = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

variable "aws-access-key" {
  type        = string
  description = "this is the access of aws"
  sensitive   = true
  default     = ""
}

#variable "aws-region" {
  type        = string
  description = "provides the aws vpc region"
  default     = "us-east-1"
}

variable "aws-secret-key" {
  type        = string
  description = "secret key of your aws profile"
  sensitive   = true
  default     = ""
}

variable "aws-instance-type" {
  type        = string
  description = "launch the type of instance micro is free tier"
  default     = "t2.micro"
}

variable "aws-ssh-username" {
  type    = string
  default = "ubuntu"
}

variable "db_password" {
  type    = string
  default = ""
}

variable "db_user" {
  type    = string
  default = "postgres"
}

variable "db_name" {
  type    = string
  default = "postgres"
}

variable "aws-subnet-id" {
  type    = string
  default = "subnet-005351033298940ef"
}

variable "zip-path" {
  type    = string
  default = "" #built by using CI
}

variable "aws-profile" {
  type    = string
  default = "dev"
}

variable "port" {
  type    = string
  default = ""
}

variable "db_host" {
  type    = string
  default = ""
}

variable "db_port" {
  type    = string
  default = ""
}

#us-east-1
variable "aws-source-ami" {
  type    = string
  default = "ami-04a81a99f5ec58529"
}

source "amazon-ebs" "aws-machine-image" {

  # profile to use in aws
  profile = var.aws-profile

  #ami configuration
  ami_name        = "healthz-machine-image-${formatdate("YYYY_MM_DD", timestamp())}"
  ami_description = "Creating a custom image for healthz postgresDB"

  #access configuration
  region = var.aws-region

  #run configuration
  instance_type = var.aws-instance-type
  source_ami    = var.aws-source-ami
  subnet_id     = var.aws-subnet-id

  #communicater configuration
  ssh_username = var.aws-ssh-username

  #block devices configurations
  launch_block_device_mappings {
    device_name           = "/dev/sda1" # Default root volume device name
    delete_on_termination = true
    volume_size           = 25
    volume_type           = "gp2"
  }
}

variable "gcp-project-id" {
  type    = string
  default = "devproject-451800"
}

variable "gcp-zone" {
  type    = string
  default = "us-central1-a"
}

variable "gcp-image-family" {
  type    = string
  default = "gcp-csye6225-cloud"
}

variable "gcp-machine-type" {
  type    = string
  default = "e2-micro"
}

source "googlecompute" "gcp-machine-image" {
  project_id          = var.gcp-project-id
  source_image_family = "ubuntu-2404-lts-amd64"
  zone                = var.gcp-zone
  ssh_username        = var.aws-ssh-username
  image_name          = "gcp-csye6225-cloud-{{timestamp}}"
  image_family        = var.gcp-image-family
  image_labels = {
    created-by = "packer"
  }
  # Optional settings
  machine_type = var.gcp-machine-type
  network      = "default"
  subnetwork   = "default"
}

build {
  sources = [
    "source.amazon-ebs.aws-machine-image",
    "souce.googlecompute.gcp-machine-image",
  ]

  provisioner "file" {
    source      = var.zip-path
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
    script = "../script/intial-updates.sh"
  }

  provisioner "shell" {
    environment_vars = [
      "DB_PASSWORD=${var.db_password}",
      "DB_NAME=${var.db_name}",
      "DB_USER=${var.db_user}",
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
    script = "../script/db-node-install.sh"
  }

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
    script = "../script/user-group-unzip.sh"
  }

  provisioner "shell" {
    script = "../script/install-modules.sh"
    environment_vars = [
      "PORT=${var.port}",
      "DB_HOST=${var.db_host}",
      "DB_PORT=${var.db_port}",
      "DB_NAME=${var.db_name}",
      "DB_USER=${var.db_user}",
      "DB_PASSWORD=${var.db_password}",
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
  }

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
    script = "../script/start-service.sh"
  }

  provisioner "shell" {
    inline = [
      "echo 'Checking for git installation...'",
      "if which git > /dev/null; then",
      "  echo 'Git is installed. Removing git...'",
      "  sudo apt-get remove -y git || sudo yum remove -y git",
      "  sudo apt-get autoremove -y || sudo yum autoremove -y",
      "fi",
      "# Verify git is no longer installed",
      "if which git > /dev/null; then",
      "  echo 'ERROR: git is still installed. AMI requirements not met!'",
      "  exit 1",
      "else",
      "  echo 'SUCCESS: git is not installed in the AMI as required'",
      "fi"
    ]
  }
}

