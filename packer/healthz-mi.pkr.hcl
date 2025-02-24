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

variable "aws-region" {
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

variable "aws-source-ami" {
  type    = string
  default = ""
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
  default = ""
}

variable "zip-path" {
  type    = string
  default = "" #built by using CI
}


source "amazon-ebs" "aws-machine-image" {

  # profile to use in aws
  profile = "dev"

  #ami configuration
  ami_name        = "healthz-machine-image-${formatdate("YYYY_MM_DD", timestamp())}"
  ami_description = "Creating a custom image for healthz postgresDB"

  #access configuration
  region     = var.aws-region
  access_key = var.aws-access-key
  secret_key = var.aws-secret-key

  #polling configuration
  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  #run configuration
  instance_type = var.aws-instance-type
  source_ami    = var.aws-source-ami
  source_ami_filter {
    filters = {
      virtualization-type = "hvm"
      name                = "ubuntu/images/*ubuntu-xenial-16.04-amd64-server-*"
      root-device-type    = "ebs"
    }
    owners      = ["099720109477"]
    most_recent = true
  }
  subnet_id = var.aws-subnet-id

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

build {
  sources = [
    "source.amazon-ebs.aws-machine-image",
  ]

  provisioner "file" {
    source      = var.zip-path
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    script = "./../script/intial-updates.sh"
  }

  provisioner "shell" {
    environment_vars = [
      "DB_PASSWORD=${var.db_password}",
      "DB_NAME=${var.db_name}",
      "DB_USER=${var.db_user}",
    ]
    script = "./../script/db-node-install.sh"
  }

  provisioner "shell" {
    script = "./../script/user-group-unzip.sh"
  }

  provisioner "shell" {
    script = "./../script/install-modules.sh"
  }

  provisioner "shell" {
    script = "./../script/start-service.sh"
  }
}