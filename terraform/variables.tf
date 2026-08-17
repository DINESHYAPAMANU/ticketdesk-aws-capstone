variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "ticketdesk"
}

variable "project" {
  description = "Project name tag"
  type        = string
  default     = "TicketDesk"
}

variable "owner" {
  description = "Owner tag"
  type        = string
  default     = "Pod"
}

variable "cost_center" {
  description = "CostCenter tag"
  type        = string
  default     = "Engineering"
}

variable "db_username" {
  description = "Master username for RDS SQL Server"
  type        = string
  default     = "sa_admin"
}

variable "db_password" {
  description = "Master password for RDS SQL Server"
  type        = string
  sensitive   = true
  default     = "TicketDeskPass2026!"
}
