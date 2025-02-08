#!/bin/bash

# Run tests
npm run test:ci

# Run security audit
npm run security-audit

# Build for production
npm run build:production

# Analyze bundle
npm run analyze

# Generate service worker
npm run generate-sw

# Compress assets
gzip -9 build/static/js/*.js
gzip -9 build/static/css/*.css 