class NotificationService {
    constructor() {
        this.permission = false;
        this.init();
    }

    async init() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
        }
    }

    async notifyOpportunity(profit, tokens, exchanges) {
        if (this.permission === 'granted') {
            new Notification('Arbitrage Opportunity', {
                body: `Potential profit: ${profit} ETH\n${tokens.join(' -> ')}\n${exchanges.join(' -> ')}`,
                icon: '/logo.png'
            });
        }
    }
} 