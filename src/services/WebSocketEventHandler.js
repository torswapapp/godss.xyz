import AlertService from './AlertService';
import PerformanceMonitorService from './PerformanceMonitorService';

class WebSocketEventHandler {
    constructor() {
        this.handlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    initialize(wsUrl) {
        try {
            this.ws = new WebSocket(wsUrl);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket initialization failed:', error);
            this.handleReconnect();
        }
    }

    setupEventListeners() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.subscribeToEvents();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleEvent(data);
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            AlertService.notify({
                type: 'ERROR',
                severity: 'error',
                title: 'WebSocket Error',
                message: 'Connection error occurred'
            });
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            this.handleReconnect();
        };
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.initialize(this.ws.url);
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
        } else {
            AlertService.notify({
                type: 'ERROR',
                severity: 'error',
                title: 'Connection Failed',
                message: 'Unable to establish WebSocket connection'
            });
        }
    }

    handleEvent(data) {
        switch (data.type) {
            case 'PERFORMANCE_UPDATE':
                this.handlePerformanceUpdate(data.payload);
                break;
            case 'TRADE_EXECUTION':
                this.handleTradeExecution(data.payload);
                break;
            case 'GAS_PRICE_UPDATE':
                this.handleGasPriceUpdate(data.payload);
                break;
            case 'NETWORK_STATUS':
                this.handleNetworkStatus(data.payload);
                break;
            default:
                console.warn('Unknown event type:', data.type);
        }
    }

    handlePerformanceUpdate(data) {
        PerformanceMonitorService.recordTradeExecution(
            data.executionTime,
            data.success,
            data.gasUsed
        );

        if (data.executionTime > 2000) {
            AlertService.notify({
                type: 'WARNING',
                severity: 'warning',
                title: 'High Latency',
                message: `Execution time: ${data.executionTime}ms`
            });
        }
    }

    handleTradeExecution(data) {
        const handlers = this.handlers.get('TRADE_EXECUTION') || [];
        handlers.forEach(handler => handler(data));

        // Record performance metrics
        PerformanceMonitorService.recordTradeExecution(
            data.duration,
            data.success,
            data.gasUsed
        );
    }

    handleGasPriceUpdate(data) {
        const handlers = this.handlers.get('GAS_PRICE_UPDATE') || [];
        handlers.forEach(handler => handler(data));

        // Check if gas price is above threshold
        AlertService.checkGasPrice(data.gasPrice);
    }

    handleNetworkStatus(data) {
        const handlers = this.handlers.get('NETWORK_STATUS') || [];
        handlers.forEach(handler => handler(data));

        // Check network health
        if (data.blockDelay > 5) {
            AlertService.notify({
                type: 'WARNING',
                severity: 'warning',
                title: 'Network Delay',
                message: `Block delay: ${data.blockDelay} seconds`
            });
        }
    }

    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType).add(handler);
    }

    unsubscribe(eventType, handler) {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    subscribeToEvents() {
        // Subscribe to relevant blockchain events
        const subscribeMessage = {
            type: 'SUBSCRIBE',
            channels: [
                'PERFORMANCE_UPDATE',
                'TRADE_EXECUTION',
                'GAS_PRICE_UPDATE',
                'NETWORK_STATUS'
            ]
        };
        this.ws.send(JSON.stringify(subscribeMessage));
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default new WebSocketEventHandler(); 