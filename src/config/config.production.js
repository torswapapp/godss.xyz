export const productionConfig = {
    rateLimit: {
        requests: 50,
        windowMs: 60000,
        alertThreshold: 0.7
    },
    monitoring: {
        endpoint: process.env.REACT_APP_MONITORING_ENDPOINT,
        logLevel: 'error'
    },
    providers: {
        primary: 'alchemy',
        backup: 'infura'
    }
}; 