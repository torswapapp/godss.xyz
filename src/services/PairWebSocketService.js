import { formatUnits } from 'ethers';
import { DEX_PAIRS } from '../constants/addresses';

class PairWebSocketService {
    constructor() {
        this.ws = null;
        this.subscribers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.url = process.env.REACT_APP_WS_ENDPOINT;
    }

    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    setupEventListeners() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.subscribeToAllPairs().catch(error => this.handleWebSocketError(error));
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleUpdate(data);
            } catch (error) {
                this.handleWebSocketError(error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            if (!event.wasClean) {
                this.handleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            this.handleWebSocketError(error);
        };
    }

    async handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.calculateBackoff();
            
            console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            this.connect();
        } else {
            this.handleMaxRetriesExceeded();
        }
    }

    calculateBackoff() {
        // Exponential backoff with jitter
        const baseDelay = this.reconnectDelay;
        const maxDelay = 30000; // 30 seconds
        const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts - 1);
        const jitter = Math.random() * 1000;
        return Math.min(exponentialDelay + jitter, maxDelay);
    }

    handleMaxRetriesExceeded() {
        console.error('Max reconnection attempts exceeded');
        this.broadcastError({
            type: 'max_retries_exceeded',
            message: 'Failed to reconnect after maximum attempts',
            timestamp: Date.now()
        });
    }

    subscribeToAllPairs() {
        const pairs = [];
        Object.entries(DEX_PAIRS).forEach(([dex, dexPairs]) => {
            Object.entries(dexPairs).forEach(([pair, address]) => {
                pairs.push({ dex, pair, address });
            });
        });

        const subscribeMessage = {
            type: 'SUBSCRIBE',
            pairs: pairs.map(p => ({
                address: p.address,
                dex: p.dex,
                pair: p.pair
            }))
        };

        this.ws.send(JSON.stringify(subscribeMessage));
    }

    handleUpdate(data) {
        const { dex, pair, type, payload } = data;
        const key = `${dex}_${pair}`;

        switch (type) {
            case 'PRICE_UPDATE':
                this.notifySubscribers(key, {
                    type: 'price',
                    data: this.formatPriceUpdate(payload)
                });
                break;

            case 'LIQUIDITY_UPDATE':
                this.notifySubscribers(key, {
                    type: 'liquidity',
                    data: this.formatLiquidityUpdate(payload)
                });
                break;

            case 'TRADE_UPDATE':
                this.notifySubscribers(key, {
                    type: 'trade',
                    data: this.formatTradeUpdate(payload)
                });
                break;

            default:
                console.warn('Unknown update type:', type);
        }
    }

    formatPriceUpdate(payload) {
        return {
            price: parseFloat(formatUnits(payload.price)),
            timestamp: Date.now(),
            change: payload.priceChange
        };
    }

    formatLiquidityUpdate(payload) {
        return {
            reserves: [
                parseFloat(formatUnits(payload.reserve0)),
                parseFloat(formatUnits(payload.reserve1))
            ],
            timestamp: Date.now()
        };
    }

    formatTradeUpdate(payload) {
        return {
            amount: parseFloat(formatUnits(payload.amount)),
            price: parseFloat(formatUnits(payload.price)),
            type: payload.tradeType,
            timestamp: Date.now(),
            priceImpact: payload.priceImpact
        };
    }

    subscribe(dex, pair, callback) {
        const key = `${dex}_${pair}`;
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
        return () => this.unsubscribe(dex, pair, callback);
    }

    unsubscribe(dex, pair, callback) {
        const key = `${dex}_${pair}`;
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
            subscribers.delete(callback);
        }
    }

    notifySubscribers(key, update) {
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
            subscribers.forEach(callback => callback(update));
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.subscribers.clear();
        }
    }

    async handleWebSocketError(error) {
        console.error('WebSocket error:', error);
        
        // Notify subscribers of the error
        this.broadcastError({
            type: 'websocket_error',
            message: error.message,
            timestamp: Date.now()
        });

        // Attempt to reconnect
        await this.handleReconnect();
    }

    broadcastError(error) {
        this.subscribers.forEach((subscribers, key) => {
            subscribers.forEach(callback => {
                callback({
                    type: 'error',
                    data: error
                });
            });
        });
    }
}

export default new PairWebSocketService();