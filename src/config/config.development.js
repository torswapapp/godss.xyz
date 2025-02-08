export const developmentConfig = {
    rateLimit: {
        requests: 100,
        windowMs: 60000,
        alertThreshold: 0.8
    },
    monitoring: {
        endpoint: 'http://localhost:3001/monitoring',
        logLevel: 'debug'
    },
    providers: {
        primary: 'infura',
        backup: 'alchemy'
    }
}; 