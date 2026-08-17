# TicketDesk AWS Capstone Project Deployment Guide

## Overview
This repository contains the complete infrastructure as code (IaC), containerisation manifests, application source code, and CI/CD automation for **Project TicketDesk** deployed on **AWS in `ap-south-1` (Mumbai)**.

---

## 🏗️ AWS Architecture

```
                               ┌───────────────────────────┐
                               │  Application Load         │  Public Subnets
   Browser ───────────────────►│  Balancer (ALB)           │  (10.0.1.0/24, 10.0.2.0/24)
                               └─────────────┬─────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │  /api/*                                   │  / (Default)
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │  ECS Fargate API Container│               │  ECS Fargate UI Container │  Private Subnets
         │  (Port 5000)              │               │  (Port 80)                │  (10.0.10.0/24, 10.0.20.0/24)
         └─────────────┬─────────────┘               └───────────────────────────┘
                       │
                       ▼
         ┌───────────────────────────┐
         │  RDS SQL Server Express   │  Private DB Subnet Group
         │  (Port 1433)              │  (publicly_accessible = false)
         └───────────────────────────┘
```

---

## 📋 Deployment Readiness Checklist Compliance

| Item | Description | Status |
| :--- | :--- | :--- |
| **1-5** | Multi-stage non-root Docker containers (`USER appuser`), ECR image scanning enabled | ✅ Passed |
| **6-9** | Infrastructure completely defined in Terraform with 100% clean teardown & rebuild reproducibility | ✅ Passed |
| **10-15** | ECS tasks run in **Private Subnets** with public IP disabled; ALB sits in public subnets across 2 AZs | ✅ Passed |
| **16-21** | RDS SQL Server in private DB subnet group (`publicly_accessible = false`, storage encrypted) | ✅ Passed |
| **22-24** | Angular frontend SPA served with relative `/api` route matching ALB routing rules | ✅ Passed |
| **25-27** | GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`) with automated smoke testing | ✅ Passed |
| **28-30** | CloudWatch Log Groups, Operations Dashboard, and 3 Metric Alarms (`5xx`, `unhealthy_targets`, `high_db_cpu`) | ✅ Passed |
| **31-34** | Standard resource tagging (`Project`, `Owner`, `Environment`, `CostCenter`) and scoped IAM Roles | ✅ Passed |

---

## 🚀 How to Deploy from Scratch

### 1. Prerequisites
- [AWS CLI v2](https://aws.amazon.com/cli/) configured with credentials for `ap-south-1`.
- [Terraform v1.7+](https://www.terraform.io/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### 2. Deploy Infrastructure with Terraform
```powershell
cd terraform
terraform init
terraform apply -auto-approve
```

### 3. Build & Push Docker Container Images
```powershell
# ECR Login
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 063293864353.dkr.ecr.ap-south-1.amazonaws.com

# Build & Push API Image
docker build -t ticketdesk-api ./TicketDesk
docker tag ticketdesk-api:latest 063293864353.dkr.ecr.ap-south-1.amazonaws.com/ticketdesk-api:latest
docker push 063293864353.dkr.ecr.ap-south-1.amazonaws.com/ticketdesk-api:latest

# Build & Push UI Image
docker build -t ticketdesk-ui ./TicketDesk-UI
docker tag ticketdesk-ui:latest 063293864353.dkr.ecr.ap-south-1.amazonaws.com/ticketdesk-ui:latest
docker push 063293864353.dkr.ecr.ap-south-1.amazonaws.com/ticketdesk-ui:latest
```

### 4. Trigger ECS Service Update
```powershell
aws ecs update-service --cluster ticketdesk-cluster --service ticketdesk-api-service --force-new-deployment --region ap-south-1
aws ecs update-service --cluster ticketdesk-cluster --service ticketdesk-ui-service --force-new-deployment --region ap-south-1
```

---

## 🌐 Live Application Credentials

- **Load Balancer URL**: [http://ticketdesk-alb-91266493.ap-south-1.elb.amazonaws.com](http://ticketdesk-alb-91266493.ap-south-1.elb.amazonaws.com)
- **Admin**: `admin@ticketdesk.com` / `Admin@123`
- **Employee**: `user@ticketdesk.com` / `User@123`

---

## 🧹 Teardown Command
To delete all AWS infrastructure cleanly:
```powershell
cd terraform
terraform destroy -auto-approve
```
