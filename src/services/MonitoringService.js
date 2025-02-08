import { Analytics } from '@vercel/analytics/react';
import { inject } from '@vercel/analytics';
import * as Sentry from '@sentry/react';

class MonitoringService {
    constructor() {
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;
        inject(); // Initialize Vercel Analytics
        console.log('Vercel Analytics initialized');
        this.isInitialized = true;
    }

    logTradeExecution(tradeData) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('Trade Executed', {
                trade_amount: tradeData.amount,
                profit: tradeData.profit,
                gas_used: tradeData.gasUsed,
                path: tradeData.path.join(' -> '),
                timestamp: new Date().toISOString()
            });
        }
        console.log('Trade executed:', tradeData);
    }

    logError(error, context) {
        if (process.env.NODE_ENV === 'production') {
            Sentry.captureException(error, {
                extra: {
                    ...context,
                    timestamp: new Date().toISOString()
                }
            });
        }
        console.log('Error logged:', error, context);
    }

    trackMetric(name, value, tags = {}) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track(name, {
                value,
                ...tags
            });
        }
    }

    startTradeMonitoring(tradeId) {
        const start = Date.now();
        return {
            tradeId,
            log: (status, details) => {
                if (process.env.NODE_ENV === 'production') {
                    Analytics.track('Trade Progress', {
                        trade_id: tradeId,
                        status,
                        duration: Date.now() - start,
                        ...details
                    });
                }
            }
        };
    }

    static logMetric(name, value) {
        // Send to your metrics service
    }
}

const monitoringService = new MonitoringService();
export default monitoringService; 