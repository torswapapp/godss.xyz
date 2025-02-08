const https = require('https');
const assert = require('assert');

const ENDPOINTS = [
    '/api/health',
    '/api/version',
    // Add more critical endpoints
];

async function verifyDeployment() {
    for (const endpoint of ENDPOINTS) {
        const response = await fetch(process.env.REACT_APP_API_URL + endpoint);
        assert(response.ok, `Endpoint ${endpoint} failed`);
    }
}

verifyDeployment().catch(console.error);