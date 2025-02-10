#!/bin/bash

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install --legacy-peer-deps

# Display installed packages for debugging
npm list react-app-rewired
npm list customize-cra

# Run build
npm run build