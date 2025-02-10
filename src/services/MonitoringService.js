import { Analytics } from '@vercel/analytics/react';
import { inject } from '@vercel/analytics';
import * as Sentry from '@sentry/react';
import { WebSocket } from 'ws';

class MonitoringService {
    constructor() {
        this.ws = null;
        this.subscribers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    initialize() {
        if (process.env.NODE_ENV === 'production') {
            inject(); // Initialize Vercel Analytics
            console.log('Vercel Analytics initialized');
            this.setupCustomEvents();
        }
    }

    setupCustomEvents() {
        // Define custom events for Vercel Analytics
        const customEvents = [
            'arbitrage_opportunity',
            'trade_execution',
            'gas_price_alert',
            'price_movement',
            'contract_interaction',
            'network_status'
        ];

        customEvents.forEach(event => {
            Analytics.track(event + '_init', {
                timestamp: new Date().toISOString()
            });
        });
    }

    // Track arbitrage-specific events
    logTradeExecution(tradeData) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('trade_execution', {
                amount: tradeData.amount,
                profit: tradeData.profit,
                gas_used: tradeData.gasUsed,
                path: tradeData.path.join(' -> '),
                timestamp: new Date().toISOString(),
                network: process.env.REACT_APP_NETWORK,
                success: tradeData.success,
                execution_time: tradeData.executionTime
            });
        }
    }

    // Track performance metrics
    trackPerformance(metrics) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('performance_metrics', {
                gas_price: metrics.gasPrice,
                latency: metrics.latency,
                block_time: metrics.blockTime,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Track errors with Vercel
    logError(error, context) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('error_occurred', {
                error_message: error.message,
                error_type: error.name,
                stack: error.stack,
                context: context,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Track user interactions
    trackUserAction(action, details) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('user_action', {
                action,
                ...details,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Track network status
    trackNetworkStatus(status) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('network_status', {
                block_number: status.blockNumber,
                gas_price: status.gasPrice,
                network_congestion: status.congestion,
                timestamp: new Date().toISOString()
            });
        }
    }

    // WebSocket connection monitoring
    connect() {
        this.ws = new WebSocket(process.env.REACT_APP_WS_PROVIDER_URL);
        
        this.ws.on('open', () => {
            if (process.env.NODE_ENV === 'production') {
                Analytics.track('websocket_connected', {
                    timestamp: new Date().toISOString()
                });
            }
            this.reconnectAttempts = 0;
            this.subscribe();
        });

        this.ws.on('error', (error) => {
            if (process.env.NODE_ENV === 'production') {
                Analytics.track('websocket_error', {
                    error_message: error.message,
                    timestamp: new Date().toISOString()
                });
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

    // New methods for arbitrage monitoring
    trackArbitrageOpportunity(opportunity) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('arbitrage_opportunity', {
                path: opportunity.path.join(' -> '),
                expectedProfit: opportunity.profit,
                timestamp: new Date().toISOString(),
                gasPrice: opportunity.gasPrice,
                estimatedGas: opportunity.estimatedGas,
                tokens: opportunity.tokens,
                exchanges: opportunity.exchanges,
                netProfit: opportunity.netProfit
            });
        }
    }

    trackFlashLoanExecution(data) {
        if (process.env.NODE_ENV === 'production') {
            Analytics.track('flash_loan_execution', {
                amount: data.amount,
                token: data.token,
                profit: data.profit,
                gasUsed: data.gasUsed,
                path: data.path,
                timestamp: new Date().toISOString(),
                success: data.success,
                blockNumber: data.blockNumber,
                txHash: data.txHash
            });
        }
    }
}

const monitoringService = new MonitoringService();
export default monitoringService; 