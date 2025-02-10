import monitoringService from './MonitoringService';

class AlertManager {
    constructor() {
        this.alerts = new Map();
        this.thresholds = {
            gasPrice: parseFloat(process.env.REACT_APP_MAX_GAS_PRICE),
            profitThreshold: parseFloat(process.env.REACT_APP_MIN_PROFIT_THRESHOLD),
            errorRate: parseFloat(process.env.REACT_APP_ERROR_NOTIFICATION_THRESHOLD),
            latency: parseFloat(process.env.REACT_APP_PERFORMANCE_ALERT_LATENCY)
        };
    }

    async checkAndAlert(metric, value, context = {}) {
        const alert = this.evaluateMetric(metric, value);
        if (alert) {
            await this.triggerAlert(alert, context);
            return true;
        }
        return false;
    }

    evaluateMetric(metric, value) {
        switch (metric) {
            case 'gasPrice':
                return value > this.thresholds.gasPrice ? {
                    type: 'HIGH_GAS_PRICE',
                    severity: 'warning',
                    message: `Gas price (${value} gwei) exceeds threshold`
                } : null;

            case 'profitability':
                return value < this.thresholds.profitThreshold ? {
                    type: 'LOW_PROFIT',
                    severity: 'warning',
                    message: `Profit (${value} ETH) below threshold`
                } : null;

            case 'errorRate':
                return value > this.thresholds.errorRate ? {
                    type: 'HIGH_ERROR_RATE',
                    severity: 'critical',
                    message: `Error rate (${value}%) exceeds threshold`
                } : null;

            default:
                return null;
        }
    }

    async triggerAlert(alert, context) {
        // Log to monitoring service
        monitoringService.trackUserAction('alert_triggered', {
            ...alert,
            context,
            timestamp: new Date().toISOString()
        });

        // Send to webhook if configured
        if (process.env.REACT_APP_ALERT_WEBHOOK) {
            await this.sendWebhookAlert(alert, context);
        }

        // Trigger automatic rollback if needed
        if (this.shouldTriggerRollback(alert)) {
            await this.initiateRollback(alert, context);
        }
    }

    async sendWebhookAlert(alert, context) {
        try {
            await fetch(process.env.REACT_APP_ALERT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alert,
                    context,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Failed to send webhook alert:', error);
        }
    }

    shouldTriggerRollback(alert) {
        return alert.severity === 'critical' || 
               (alert.type === 'HIGH_ERROR_RATE' && alert.value > this.thresholds.errorRate * 2);
    }

    async initiateRollback(alert, context) {
        try {
            monitoringService.trackUserAction('rollback_initiated', {
                alert,
                context,
                timestamp: new Date().toISOString()
            });

            // Stop all active trades
            await this.stopActiveOperations();

            // Revert to last known good state
            await this.revertToLastGoodState();

            monitoringService.trackUserAction('rollback_completed', {
                alert,
                context,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            monitoringService.logError(error, {
                service: 'AlertManager',
                method: 'initiateRollback',
                alert,
                context
            });
        }
    }

    async stopActiveOperations() {
        // Implementation to stop active operations
    }

    async revertToLastGoodState() {
        // Implementation to revert to last known good state
    }
}

export default new AlertManager(); 