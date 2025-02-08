#!/bin/bash

# Deploy to CloudFront/CloudFlare
aws s3 sync build/ s3://$S3_BUCKET --delete --cache-control max-age=31536000,public

# Invalidate cache
aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"

# Configure custom domain and SSL
aws cloudfront update-distribution \
    --id $CLOUDFRONT_DISTRIBUTION_ID \
    --alias $CUSTOM_DOMAIN \
    --ssl-certificate $SSL_CERT_ARN 