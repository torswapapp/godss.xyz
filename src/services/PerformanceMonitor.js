import { init as initApm } from '@elastic/apm-rum';
import { reportWebVitals } from 'web-vitals';

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.initializeApm();
        this.setupWebVitals();
    }

    initializeApm() {
        if (process.env.NODE_ENV === 'production') {
            initApm({
                serviceName: 'flashloan-dashboard',
                serverUrl: process.env.REACT_APP_APM_SERVER,
                environment: process.env.NODE_ENV
            });
        }
    }

    setupWebVitals() {
        reportWebVitals(({ name, value, id }) => {
            this.trackMetric(name, value, id);
        });
    }

    trackMetric(name, value, id) {
        this.metrics.set(`${name}-${id}`, {
            value,
            timestamp: Date.now()
        });

        if (process.env.NODE_ENV === 'production') {
            // Send to monitoring service
        }
    }
}

export default new PerformanceMonitor(); 