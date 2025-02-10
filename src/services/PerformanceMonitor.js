import { reportWebVitals } from 'web-vitals';

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.setupWebVitals();
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
            // Send to monitoring service if needed
            console.log('Performance metric:', { name, value, id });
        }
    }

    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
}

export default new PerformanceMonitor(); 