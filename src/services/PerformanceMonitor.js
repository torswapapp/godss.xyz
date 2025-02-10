import { reportWebVitals } from 'web-vitals';

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;
        
        reportWebVitals(this.handleWebVital.bind(this));
        this.isInitialized = true;
    }

    handleWebVital(metric) {
        const { name, value, id } = metric;
        this.metrics.set(`${name}-${id}`, {
            value,
            timestamp: Date.now()
        });

        if (process.env.NODE_ENV === 'production') {
            console.log('Performance metric:', metric);
        }
    }

    getMetrics() {
        return Array.from(this.metrics.entries()).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    }

    clearMetrics() {
        this.metrics.clear();
    }
}

export default new PerformanceMonitor(); 