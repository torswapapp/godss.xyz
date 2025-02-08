const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();
const s3 = new AWS.S3();

async function configureCDN() {
    // Configure S3 bucket for static hosting
    await s3.putBucketWebsite({
        Bucket: process.env.REACT_APP_S3_BUCKET,
        WebsiteConfiguration: {
            IndexDocument: { Suffix: 'index.html' },
            ErrorDocument: { Key: 'index.html' }
        }
    }).promise();

    // Configure CloudFront
    await cloudfront.updateDistribution({
        Id: process.env.REACT_APP_CLOUDFRONT_DISTRIBUTION_ID,
        DistributionConfig: {
            Enabled: true,
            DefaultRootObject: 'index.html',
            Origins: {
                Items: [{
                    DomainName: `${process.env.REACT_APP_S3_BUCKET}.s3.amazonaws.com`,
                    Id: 'S3Origin',
                    S3OriginConfig: {
                        OriginAccessIdentity: ''
                    }
                }]
            },
            DefaultCacheBehavior: {
                TargetOriginId: 'S3Origin',
                ViewerProtocolPolicy: 'redirect-to-https',
                MinTTL: 0,
                DefaultTTL: 86400,
                MaxTTL: 31536000
            }
        }
    }).promise();
}

configureCDN().catch(console.error); 