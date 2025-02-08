class WebSocketService {
    constructor(url = process.env.REACT_APP_WS_URL) {
        this.url = url;
        this.ws = null;
        this.subscribers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = null;
    }

    connect() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }

        if (!this.url) {
            console.log('WebSocket URL not provided, running in mock mode');
            this.mockDataInterval = setInterval(() => {
                this.notifySubscribers('PRICE_UPDATE', {
                    prices: {
                        'ETH/USDC': (1850 + Math.random() * 10).toFixed(2),
                        'ETH/USDT': (1849 + Math.random() * 10).toFixed(2)
                    }
                });
            }, 5000);
            return;
        }

        try {
            this.ws = new WebSocket(this.url);
            this.setupWebSocketHandlers();
        } catch (error) {
            console.log('WebSocket connection failed, running in mock mode');
            this.mockDataInterval = setInterval(() => {
                this.notifySubscribers('PRICE_UPDATE', {
                    prices: {
                        'ETH/USDC': (1850 + Math.random() * 10).toFixed(2),
                        'ETH/USDT': (1849 + Math.random() * 10).toFixed(2)
                    }
                });
            }, 5000);
            return;
        }
    }

    setupWebSocketHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket Connected');
            this.reconnectAttempts = 0;
            this.notifySubscribers('connection', { status: 'connected' });
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.notifySubscribers(data.type, data);
        };

        this.ws.onclose = () => {
            console.log('WebSocket Disconnected');
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.notifySubscribers('error', { error });
        };
    }

    subscribe(type, callback) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type).add(callback);
    }

    unsubscribe(type, callback) {
        if (this.subscribers.has(type)) {
            this.subscribers.get(type).delete(callback);
        }
    }

    notifySubscribers(type, data) {
        if (!this.subscribers) {
            this.subscribers = new Map();
        }
        if (this.subscribers.has(type)) {
            this.subscribers.get(type).forEach(callback => callback(data));
        }
    }

    sendMessage(type, data) {
        if (!this.ws) return;
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        if (this.mockDataInterval) {
            clearInterval(this.mockDataInterval);
        }
    }
}

export default WebSocketService; 