const fs = require('fs');
const path = require('path');

const buildEnvFile = () => {
    try {
        const envExample = fs.readFileSync('.env.example', 'utf8');
        const envContent = envExample.split('\n')
            .map(line => {
                if (line.startsWith('REACT_APP_') || line.startsWith('VERCEL_')) {
                    const [key] = line.split('=');
                    return `${key}=${process.env[key] || ''}`;
                }
                return line;
            })
            .join('\n');

        fs.writeFileSync('.env', envContent);
        console.log('Environment file created successfully');
    } catch (error) {
        console.warn('Warning: Could not create environment file', error);
    }
};

buildEnvFile();