const securityConfig = {
    cors: {
        allowedOrigins: process.env.REACT_APP_ALLOWED_ORIGINS?.split(',') || ['https://your-domain.com'],
        allowedMethods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    },
    cache: {
        staticAssets: {
            maxAge: '30d',
            immutable: true
        },
        api: {
            maxAge: '5m',
            staleWhileRevalidate: '1h'
        }
    }
};

export default securityConfig; 