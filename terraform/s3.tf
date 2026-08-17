# Private S3 Bucket for Static Frontend Build
resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.app_name}-frontend-${var.aws_region}-063293864353"
  force_destroy = true

  tags = {
    Name        = "${var.app_name}-frontend-bucket"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}

# Block all public access (S3 bucket must NOT be public)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket Policy: Allow s3:GetObject ONLY from CloudFront via Origin Access Control (OAC)
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn
          }
        }
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.frontend
  ]
}
