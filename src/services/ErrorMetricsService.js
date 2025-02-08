class ErrorMetricsService {
    constructor() {
        this.metrics = {
            errors: new Map(),
            recoveries: new Map(),
            circuitBreakers: new Map()
        };
        this.subscribers = new Set();
    }

    recordError(context, error) {
        const key = `${context}_${error.code || 'unknown'}`;
        const currentCount = this.metrics.errors.get(key) || 0;
        this.metrics.errors.set(key, currentCount + 1);

        const errorMetric = {
            timestamp: Date.now(),
            context,
            errorType: error.code || 'unknown',
            message: error.message,
            count: currentCount + 1
        };

        this.notifySubscribers('error', errorMetric);
        return errorMetric;
    }

    recordRecovery(context, duration) {
        const key = context;
        const recoveries = this.metrics.recoveries.get(key) || [];
        recoveries.push({
            timestamp: Date.now(),
            duration
        });
        this.metrics.recoveries.set(key, recoveries.slice(-100)); // Keep last 100 recoveries

        const recoveryMetric = {
            context,
            duration,
            averageDuration: this.calculateAverageRecoveryTime(key)
        };

        this.notifySubscribers('recovery', recoveryMetric);
        return recoveryMetric;
    }

    updateCircuitBreaker(context, state) {
        this.metrics.circuitBreakers.set(context, {
            state,
            timestamp: Date.now()
        });

        const breakerMetric = {
            context,
            state,
            timestamp: Date.now()
        };

        this.notifySubscribers('circuitBreaker', breakerMetric);
        return breakerMetric;
    }

    calculateAverageRecoveryTime(context) {
        const recoveries = this.metrics.recoveries.get(context) || [];
        if (recoveries.length === 0) return 0;
        
        const sum = recoveries.reduce((acc, curr) => acc + curr.duration, 0);
        return sum / recoveries.length;
    }

    getErrorRate(context, timeWindow = 300000) { // 5 minutes default
        const errors = Array.from(this.metrics.errors.entries())
            .filter(([key]) => key.startsWith(context))
            .reduce((acc, [_, count]) => acc + count, 0);

        return errors / (timeWindow / 1000); // errors per second
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(type, metric) {
        this.subscribers.forEach(callback => callback(type, metric));
    }

    reset() {
        this.metrics.errors.clear();
        this.metrics.recoveries.clear();
        this.metrics.circuitBreakers.clear();
    }
}

export default new ErrorMetricsService();