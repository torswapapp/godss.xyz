# Deployment Checklist

## Pre-deployment
- [ ] All tests passing
- [ ] Security audit passed
- [ ] Environment variables configured
- [ ] Backup RPC providers configured
- [ ] Rate limits set
- [ ] Monitoring configured

## Deployment
- [ ] Run build script
- [ ] Verify bundle size
- [ ] Deploy to CDN
- [ ] Update DNS if needed
- [ ] Clear CDN cache

## Post-deployment
- [ ] Verify all endpoints
- [ ] Check monitoring
- [ ] Test critical functions
- [ ] Monitor error rates 