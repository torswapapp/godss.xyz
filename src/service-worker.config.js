module.exports = {
    staticFileGlobs: [
        'build/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}',
    ],
    stripPrefix: 'build/',
    runtimeCaching: [{
        urlPattern: /^https:\/\/api\./,
        handler: 'networkFirst'
    }],
    navigateFallback: '/index.html',
    navigateFallbackWhitelist: [/^(?!\/__).*/]
}; 