import { WebSocketProvider } from 'ethers';
import monitoringService from './MonitoringService';

class WebSocketManager {
    constructor() {
        this.provider = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.backupUrls = process.env.REACT_APP_WS_FALLBACK_URLS?.split(',') || [];
        this.currentUrlIndex = 0;
    }

    async connect() {
        try {
            const url = this.getCurrentWsUrl();
            this.provider = new WebSocketProvider(url);
            
            this.provider._websocket.on('open', () => {
                this.reconnectAttempts = 0;
                monitoringService.trackUserAction('websocket_connected', { url });
            });

            this.setupEventListeners();
            return this.provider;
        } catch (error) {
            return this.handleConnectionError(error);
        }
    }

    setupEventListeners() {
        this.provider._websocket.on('error', this.handleConnectionError.bind(this));
        this.provider._websocket.on('close', this.handleConnectionClose.bind(this));
    }

    async handleConnectionError(error) {
        monitoringService.logError(error, { service: 'WebSocketManager' });
        return this.attemptReconnect();
    }

    async handleConnectionClose() {
        monitoringService.trackUserAction('websocket_disconnected');
        return this.attemptReconnect();
    }

    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.switchToFallbackUrl();
            this.reconnectAttempts = 0;
        }

        this.reconnectAttempts++;
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));
        return this.connect();
    }

    getCurrentWsUrl() {
        return this.currentUrlIndex === 0 
            ? process.env.REACT_APP_WS_PROVIDER_URL 
            : this.backupUrls[this.currentUrlIndex - 1];
    }

    switchToFallbackUrl() {
        this.currentUrlIndex = (this.currentUrlIndex + 1) % (this.backupUrls.length + 1);
        monitoringService.trackUserAction('websocket_fallback_switch', {
            newUrl: this.getCurrentWsUrl()
        });
    }
}

export default new WebSocketManager(); 