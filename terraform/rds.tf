resource "aws_db_subnet_group" "rds_subnet_group" {
  name        = "${var.app_name}-db-subnet-group"
  subnet_ids  = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  description = "Private DB Subnet Group for TicketDesk SQL Server"

  tags = {
    Name        = "${var.app_name}-db-subnet-group"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

resource "aws_db_instance" "sqlserver" {
  identifier             = "${var.app_name}-sqlserver"
  engine                 = "sqlserver-ex"
  engine_version         = "15.00"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp2"
  storage_encrypted      = true
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  skip_final_snapshot    = true

  lifecycle {
    ignore_changes = [password, username]
  }

  tags = {
    Name        = "${var.app_name}-sqlserver"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}
