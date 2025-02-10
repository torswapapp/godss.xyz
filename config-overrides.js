const path = require('path');

module.exports = function override(config, env) {
    config.resolve = {
        ...config.resolve,
        alias: {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        },
        fallback: {
            ...config.resolve.fallback,
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "assert": require.resolve("assert/"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "url": require.resolve("url/")
        }
    };
    
    // Add webpack dev server configuration
    config.devServer = {
        ...config.devServer,
        headers: { "Access-Control-Allow-Origin": "*" }
    };
    
    return config;
}