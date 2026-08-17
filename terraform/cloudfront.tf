# CloudFront Origin Access Control (OAC) for Private S3 Bucket
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.app_name}-s3-oac"
  description                       = "Origin Access Control for private S3 frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# AWS Managed Policy IDs
# Managed-CachingOptimized: 65832700-8847-4940-abb0-940476769732
# Managed-CachingDisabled: 41355a44-b78d-4b89-84ae-01a403064cb8
# Managed-AllViewerExceptHostHeader: b6893532-c050-4176-850d-77813f5725a3

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "CloudFront Distribution for TicketDesk SPA + ALB API"

  # S3 Origin (Static Frontend)
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  # ALB Origin (Dynamic API /api/*)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB-${aws_lb.main.name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default Cache Behavior (Static Frontend /* -> S3)
  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "65832700-8847-4940-abb0-940476769732"
  }

  # Ordered Cache Behavior (/api/* -> ALB)
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "ALB-${aws_lb.main.name}"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = "41355a44-b78d-4b89-84ae-01a403064cb8"
    origin_request_policy_id = "b6893532-c050-4176-850d-77813f5725a3"
  }

  # Ordered Cache Behavior (/swagger* -> ALB)
  ordered_cache_behavior {
    path_pattern             = "/swagger*"
    target_origin_id         = "ALB-${aws_lb.main.name}"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = "41355a44-b78d-4b89-84ae-01a403064cb8"
    origin_request_policy_id = "b6893532-c050-4176-850d-77813f5725a3"
  }

  # Custom Error Responses for Single Page Application (SPA) Routing
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "${var.app_name}-cloudfront"
    Project     = var.project
    Owner       = var.owner
    Environment = var.environment
    CostCenter  = var.cost_center
  }
}
