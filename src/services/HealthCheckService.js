class HealthCheckService {
    static async checkHealth() {
        const checks = {
            rpc: await this.checkRPCConnection(),
            websocket: await this.checkWebSocket(),
            cache: await this.checkCache(),
            contracts: await this.checkContracts()
        };

        return {
            status: Object.values(checks).every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            checks
        };
    }

    static async checkRPCConnection() {
        try {
            const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
            return { status: 'healthy', blockNumber };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    static async checkWebSocket() {
        // Add WebSocket health check logic
    }

    static async checkCache() {
        // Add cache health check logic
    }

    static async checkContracts() {
        // Add contract health check logic
    }
}

export default HealthCheckService; 