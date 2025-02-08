import { WebSocket } from 'ws';
import { formatEther } from 'ethers';

class WebSocketPriceService {
    constructor() {
        this.subscribers = new Map();
        this.connections = new Map();
        this.reconnectAttempts = new Map();
        this.MAX_RECONNECT_ATTEMPTS = 5;
    }

    connect(exchange, pair) {
        const wsEndpoint = this.getWebSocketEndpoint(exchange);
        const connectionKey = `${exchange}-${pair}`;

        if (this.connections.has(connectionKey)) {
            return;
        }

        const ws = new WebSocket(wsEndpoint);

        ws.onopen = () => {
            console.log(`Connected to ${exchange} for ${pair}`);
            this.reconnectAttempts.set(connectionKey, 0);
            this.subscribeToPrice(ws, pair, exchange);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const price = this.extractPrice(data, exchange);
            if (price) {
                this.notifySubscribers(exchange, pair, price);
            }
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error for ${exchange}:`, error);
        };

        ws.onclose = () => {
            console.log(`Disconnected from ${exchange}`);
            this.handleDisconnect(exchange, pair);
        };

        this.connections.set(connectionKey, ws);
    }

    getWebSocketEndpoint(exchange) {
        const endpoints = {
            'uniswap': 'wss://api.uniswap.org/v1/ws',
            'sushiswap': 'wss://api.sushi.com/ws',
            // Add more exchanges as needed
        };
        return endpoints[exchange.toLowerCase()];
    }

    subscribeToPrice(ws, pair, exchange) {
        const subscriptionMessage = {
            'uniswap': {
                method: 'SUBSCRIBE',
                params: [`${pair}@trade`],
                id: Date.now()
            },
            'sushiswap': {
                type: 'subscribe',
                channel: 'trades',
                pair: pair
            }
        };

        ws.send(JSON.stringify(subscriptionMessage[exchange.toLowerCase()]));
    }

    extractPrice(data, exchange) {
        try {
            switch (exchange.toLowerCase()) {
                case 'uniswap':
                    return formatEther(data.price);
                case 'sushiswap':
                    return formatEther(data.data.price);
                default:
                    return null;
            }
        } catch (error) {
            console.error('Error extracting price:', error);
            return null;
        }
    }

    handleDisconnect(exchange, pair) {
        const connectionKey = `${exchange}-${pair}`;
        const attempts = (this.reconnectAttempts.get(connectionKey) || 0) + 1;
        this.reconnectAttempts.set(connectionKey, attempts);

        if (attempts <= this.MAX_RECONNECT_ATTEMPTS) {
            setTimeout(() => {
                this.connect(exchange, pair);
            }, Math.min(1000 * Math.pow(2, attempts), 30000));
        }
    }

    subscribe(exchange, pair, callback) {
        const key = `${exchange}-${pair}`;
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
            this.connect(exchange, pair);
        }
        this.subscribers.get(key).add(callback);
    }

    unsubscribe(exchange, pair, callback) {
        const key = `${exchange}-${pair}`;
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
            subscribers.delete(callback);
            if (subscribers.size === 0) {
                this.subscribers.delete(key);
                const ws = this.connections.get(key);
                if (ws) {
                    ws.close();
                    this.connections.delete(key);
                }
            }
        }
    }

    notifySubscribers(exchange, pair, price) {
        const key = `${exchange}-${pair}`;
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
            subscribers.forEach(callback => callback({
                exchange,
                pair,
                price,
                timestamp: Date.now()
            }));
        }
    }
}

export default new WebSocketPriceService(); 