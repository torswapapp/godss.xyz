class AlertService {
    constructor() {
        this.subscribers = new Set();
        this.alertHistory = [];
        this.thresholds = {
            profitThreshold: parseFloat(process.env.REACT_APP_MIN_PROFIT_THRESHOLD),
            gasThreshold: parseFloat(process.env.REACT_APP_MAX_GAS_PRICE),
            slippageThreshold: 3, // 3%
            latencyThreshold: 1000 // 1 second
        };
    }

    setThreshold(type, value) {
        this.thresholds[type] = value;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notify(alert) {
        const alertWithTimestamp = {
            ...alert,
            timestamp: Date.now()
        };

        this.alertHistory.push(alertWithTimestamp);
        this.subscribers.forEach(callback => callback(alertWithTimestamp));

        // Keep last 100 alerts
        if (this.alertHistory.length > 100) {
            this.alertHistory.shift();
        }
    }

    checkProfitOpportunity(opportunity) {
        if (opportunity.expectedProfit > this.thresholds.profitThreshold) {
            this.notify({
                type: 'PROFIT_OPPORTUNITY',
                severity: 'success',
                title: 'Profitable Trade Opportunity',
                message: `Expected profit: ${opportunity.expectedProfit} ETH`,
                data: opportunity
            });
        }
    }

    checkGasPrice(gasPrice) {
        if (gasPrice > this.thresholds.gasThreshold) {
            this.notify({
                type: 'HIGH_GAS',
                severity: 'warning',
                title: 'High Gas Price',
                message: `Current gas price: ${gasPrice} Gwei`,
                data: { gasPrice }
            });
        }
    }

    checkSlippage(expectedPrice, actualPrice, pair) {
        const slippage = Math.abs((actualPrice - expectedPrice) / expectedPrice * 100);
        if (slippage > this.thresholds.slippageThreshold) {
            this.notify({
                type: 'HIGH_SLIPPAGE',
                severity: 'warning',
                title: 'High Slippage Detected',
                message: `${slippage.toFixed(2)}% slippage for ${pair}`,
                data: { expectedPrice, actualPrice, slippage }
            });
        }
    }

    checkNetworkLatency(latency) {
        if (latency > this.thresholds.latencyThreshold) {
            this.notify({
                type: 'HIGH_LATENCY',
                severity: 'error',
                title: 'Network Latency Issue',
                message: `High latency detected: ${latency}ms`,
                data: { latency }
            });
        }
    }

    getRecentAlerts(count = 10) {
        return this.alertHistory.slice(-count);
    }

    getAlertsByType(type) {
        return this.alertHistory.filter(alert => alert.type === type);
    }

    clearAlerts() {
        this.alertHistory = [];
    }
}

export default new AlertService(); 