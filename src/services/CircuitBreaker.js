class CircuitBreaker {
    constructor(context, errorMetricsService, options = {}) {
        this.context = context;
        this.errorMetrics = errorMetricsService;
        this.state = 'CLOSED';
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000; // 1 minute
        this.halfOpenTimeout = options.halfOpenTimeout || 30000; // 30 seconds
        this.failureCount = 0;
        this.lastFailureTime = null;
    }

    async execute(operation) {
        if (this.state === 'OPEN') {
            if (this.shouldAttemptReset()) {
                this.transitionToHalfOpen();
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            this.handleSuccess();
            return result;
        } catch (error) {
            this.handleFailure(error);
            throw error;
        }
    }

    handleSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.reset();
        }
        this.failureCount = 0;
    }

    handleFailure(error) {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
            this.transitionToOpen();
        }

        this.errorMetrics.recordError(this.context, error);
    }

    transitionToOpen() {
        this.state = 'OPEN';
        this.errorMetrics.updateCircuitBreaker(this.context, 'OPEN');
        setTimeout(() => this.transitionToHalfOpen(), this.resetTimeout);
    }

    transitionToHalfOpen() {
        this.state = 'HALF_OPEN';
        this.errorMetrics.updateCircuitBreaker(this.context, 'HALF_OPEN');
    }

    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.errorMetrics.updateCircuitBreaker(this.context, 'CLOSED');
    }

    shouldAttemptReset() {
        return this.lastFailureTime && 
               (Date.now() - this.lastFailureTime) >= this.resetTimeout;
    }

    getState() {
        return this.state;
    }
}

export default CircuitBreaker;