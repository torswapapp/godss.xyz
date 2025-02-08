import { Analytics } from '@vercel/analytics/react';
import { inject } from '@vercel/analytics';
import * as Sentry from '@sentry/react';
import { WebSocket } from 'ws';

class MonitoringService {
    constructor() {
        this.isInitialized = false;
        this.subscribers = new Set();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
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

    connect() {
        this.ws = new WebSocket(process.env.REACT_APP_WS_PROVIDER_URL);
        
        this.ws.on('open', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.subscribe();
        });

        this.ws.on('message', (data) => {
            this.handleMessage(JSON.parse(data));
        });

        this.ws.on('close', () => {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
                this.reconnectAttempts++;
            }
        });
    }

    handleMessage(data) {
        // Process incoming data and notify subscribers
        this.subscribers.forEach(callback => callback(data));
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    unsubscribe(callback) {
        this.subscribers.delete(callback);
    }
}

const monitoringService = new MonitoringService();
export default monitoringService; 