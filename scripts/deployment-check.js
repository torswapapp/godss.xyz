const checkDeploymentRequirements = () => {
    const requiredEnvVars = [
        // Required for basic functionality
        'REACT_APP_WS_PROVIDER_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn('Warning: Missing some environment variables:', missingVars);
        // Don't exit, just warn
    }
};

checkDeploymentRequirements();