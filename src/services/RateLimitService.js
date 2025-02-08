class RateLimitService {
    constructor() {
        this.requests = new Map();
        this.alerts = new Map();
        this.maxRequests = parseInt(process.env.REACT_APP_RATE_LIMIT_REQUESTS);
        this.windowMs = parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW_MS);
        this.alertThreshold = 0.8; // Alert at 80% usage
    }

    checkLimit(apiKey) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.requests.has(apiKey)) {
            this.requests.set(apiKey, []);
        }

        const requests = this.requests.get(apiKey);
        const recentRequests = requests.filter(time => time > windowStart);
        
        // Monitor usage
        this.monitorUsage(apiKey, recentRequests.length);
        
        if (recentRequests.length >= this.maxRequests) {
            this.sendAlert(apiKey, 'RATE_LIMIT_EXCEEDED');
            return false;
        }

        recentRequests.push(now);
        this.requests.set(apiKey, recentRequests);
        return true;
    }

    monitorUsage(apiKey, currentRequests) {
        const usagePercentage = currentRequests / this.maxRequests;
        
        if (usagePercentage >= this.alertThreshold && !this.alerts.get(apiKey)) {
            this.sendAlert(apiKey, 'APPROACHING_LIMIT', {
                current: currentRequests,
                max: this.maxRequests,
                percentage: usagePercentage * 100
            });
            this.alerts.set(apiKey, true);
        } else if (usagePercentage < this.alertThreshold) {
            this.alerts.set(apiKey, false);
        }
    }

    sendAlert(apiKey, type, data = {}) {
        const alert = {
            type,
            apiKey,
            timestamp: new Date().toISOString(),
            ...data
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.warn('Rate Limit Alert:', alert);
        }

        // Send to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            this.sendToMonitoringService(alert);
        }
    }

    async sendToMonitoringService(alert) {
        try {
            await fetch(process.env.REACT_APP_MONITORING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alert)
            });
        } catch (error) {
            console.error('Failed to send alert:', error);
        }
    }

    async waitForAvailability(apiKey, maxWaitTime = 30000) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const check = () => {
                if (this.checkLimit(apiKey)) {
                    resolve();
                } else if (Date.now() - startTime > maxWaitTime) {
                    reject(new Error('Rate limit wait time exceeded'));
                } else {
                    setTimeout(check, 1000);
                }
            };
            check();
        });
    }
}

const rateLimitService = new RateLimitService();
export default rateLimitService; 