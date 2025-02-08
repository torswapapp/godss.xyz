import { init as initSentry } from '@sentry/react';
import { reportWebVitals } from 'web-vitals';

class ProductionOptimizer {
    constructor() {
        this.initializeSentry();
        this.initializeAnalytics();
        this.setupPerformanceMonitoring();
    }

    initializeSentry() {
        if (process.env.REACT_APP_SENTRY_DSN) {
            initSentry({
                dsn: process.env.REACT_APP_SENTRY_DSN,
                environment: process.env.NODE_ENV,
                tracesSampleRate: 1.0,
            });
        }
    }

    setupPerformanceMonitoring() {
        reportWebVitals(console.log);
    }

    initializeAnalytics() {
        // Initialize analytics services
    }
}

export default new ProductionOptimizer(); 