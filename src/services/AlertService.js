class AlertService {
    static async sendAlert(type, message, data = {}) {
        if (process.env.NODE_ENV === 'production') {
            try {
                await fetch(process.env.REACT_APP_ALERT_WEBHOOK, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type,
                        message,
                        data,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (error) {
                console.error('Failed to send alert:', error);
            }
        }
    }

    static checkThresholds(metrics) {
        const thresholds = {
            cpu: parseInt(process.env.REACT_APP_ALERT_THRESHOLD_CPU),
            memory: parseInt(process.env.REACT_APP_ALERT_THRESHOLD_MEMORY),
            errorRate: parseInt(process.env.REACT_APP_ALERT_THRESHOLD_ERROR_RATE)
        };

        if (metrics.cpu > thresholds.cpu) {
            this.sendAlert('warning', 'High CPU usage', { value: metrics.cpu });
        }

        if (metrics.memory > thresholds.memory) {
            this.sendAlert('warning', 'High memory usage', { value: metrics.memory });
        }

        if (metrics.errorRate > thresholds.errorRate) {
            this.sendAlert('error', 'High error rate', { value: metrics.errorRate });
        }
    }
}

export default AlertService; 