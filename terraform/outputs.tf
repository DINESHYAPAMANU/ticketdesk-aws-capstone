output "alb_dns_name" {
  description = "Application Load Balancer DNS URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_api_repository_url" {
  description = "ECR Repository URL for API"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_ui_repository_url" {
  description = "ECR Repository URL for UI"
  value       = aws_ecr_repository.ui.repository_url
}

output "rds_endpoint" {
  description = "RDS SQL Server endpoint"
  value       = aws_db_instance.sqlserver.address
}
