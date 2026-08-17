# 1. CloudWatch Alarm for 5xx Server Errors on ALB Target Group
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${var.app_name}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Triggers when ALB registers one or more HTTP 5xx backend errors"

  dimensions = {
    TargetGroup  = aws_lb_target_group.api.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = {
    Name        = "${var.app_name}-alb-5xx-errors-alarm"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# 2. CloudWatch Alarm for Unhealthy Target Hosts in Load Balancer
resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name          = "${var.app_name}-unhealthy-targets"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "Triggers when one or more ECS targets fail ALB health checks"

  dimensions = {
    TargetGroup  = aws_lb_target_group.api.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = {
    Name        = "${var.app_name}-unhealthy-targets-alarm"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# 3. CloudWatch Alarm for High RDS Database CPU Utilization
resource "aws_cloudwatch_metric_alarm" "high_db_cpu" {
  alarm_name          = "${var.app_name}-high-db-cpu"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when RDS SQL Server CPU utilization exceeds 80%"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.sqlserver.identifier
  }

  tags = {
    Name        = "${var.app_name}-high-db-cpu-alarm"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# CloudWatch Operations Dashboard Showing Request Count, Error Rate, Latency, CPU/Memory
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.app_name}-operations-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "HTTPCode_Target_5XX_Count", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Application Load Balancer Request Traffic & Errors"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Target Response Time Latency (Seconds)"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", aws_ecs_service.api.name, "ClusterName", aws_ecs_cluster.main.name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Fargate Task CPU & Memory Utilization (%)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.sqlserver.identifier],
            [".", "DatabaseConnections", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS SQL Server CPU & Database Connections"
        }
      }
    ]
  })
}
