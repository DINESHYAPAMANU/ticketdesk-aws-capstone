resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.app_name}-cluster"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name        = "${var.app_name}-alb"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# API Target Group
resource "aws_lb_target_group" "api" {
  name        = "${var.app_name}-api-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/health"
    protocol            = "HTTP"
    port                = "5000"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name        = "${var.app_name}-api-tg"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# UI Target Group
resource "aws_lb_target_group" "ui" {
  name        = "${var.app_name}-ui-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/"
    protocol            = "HTTP"
    port                = "80"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = {
    Name        = "${var.app_name}-ui-tg"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# ALB HTTP Listener (Port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ui.arn
  }
}

# Route /api/*, /swagger*, /health to API Target Group
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/swagger*", "/swagger/*", "/health"]
    }
  }
}

# API Task Definition (Private Subnet Container)
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.app_name}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-api"
      image     = "${aws_ecr_repository.api.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "ASPNETCORE_ENVIRONMENT", value = "Production" },
        { name = "ASPNETCORE_URLS", value = "http://+:5000" },
        { name = "ConnectionStrings__DefaultConnection", value = "Server=${aws_db_instance.sqlserver.address},1433;Database=TicketDeskDb;User Id=${var.db_username};Password=${var.db_password};TrustServerCertificate=True;MultipleActiveResultSets=true" },
        { name = "Jwt__Secret", value = "TicketDesk_Super_Secret_JWT_Key_2026_Minimum_32_Bytes_Long!" },
        { name = "Jwt__Issuer", value = "TicketDeskAPI" },
        { name = "Jwt__Audience", value = "TicketDeskUsers" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.app_name}-api"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-api-task"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# UI Task Definition (Private Subnet Container)
resource "aws_ecs_task_definition" "ui" {
  family                   = "${var.app_name}-ui"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-ui"
      image     = "${aws_ecr_repository.ui.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.app_name}-ui"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-ui-task"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# API ECS Service (Running in Private Subnets)
resource "aws_ecs_service" "api" {
  name            = "${var.app_name}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "${var.app_name}-api"
    container_port   = 5000
  }

  depends_on = [
    aws_lb_listener.http,
    aws_db_instance.sqlserver
  ]
}

# UI ECS Service (Running in Private Subnets)
resource "aws_ecs_service" "ui" {
  name            = "${var.app_name}-ui-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ui.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ui.arn
    container_name   = "${var.app_name}-ui"
    container_port   = 80
  }

  depends_on = [
    aws_lb_listener.http
  ]
}
