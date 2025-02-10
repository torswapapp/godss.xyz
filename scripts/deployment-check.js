const checkDeploymentRequirements = () => {
    const requiredEnvVars = [
        'REACT_APP_INFURA_API_KEY',
        'REACT_APP_ALCHEMY_API_KEY',
        'REACT_APP_WS_PROVIDER_URL',
        'REACT_APP_ARBITRAGE_CONTRACT_ADDRESS',
        'REACT_APP_MAX_GAS_PRICE',
        'REACT_APP_MIN_PROFIT_THRESHOLD',
        'VERCEL_ENV',
        'NEXT_PUBLIC_VERCEL_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars);
        process.exit(1);
    }
};

checkDeploymentRequirements(); 