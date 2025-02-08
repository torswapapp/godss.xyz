import { formatEther } from 'ethers';

class NetworkMetricsService {
    constructor(provider) {
        this.provider = provider;
        this.blockTimeHistory = [];
        this.lastBlockTimestamp = null;
    }

    async calculateNetworkCongestion(block) {
        try {
            const gasUsed = parseFloat(formatEther(block.gasUsed));
            const gasLimit = parseFloat(formatEther(block.gasLimit));
            return (gasUsed / gasLimit) * 100;
        } catch (error) {
            console.error('Error calculating network congestion:', error);
            return 0;
        }
    }

    async getPendingTransactions() {
        try {
            const txPool = await this.provider.send('txpool_content', []);
            return Object.keys(txPool.pending).reduce((acc, addr) => 
                acc + Object.keys(txPool.pending[addr]).length, 0
            );
        } catch (error) {
            console.error('Error getting pending transactions:', error);
            return 0;
        }
    }

    async checkNodeHealth() {
        try {
            const [blockNumber, peers] = await Promise.all([
                this.provider.getBlockNumber(),
                this.getConnectedPeers()
            ]);

            if (peers < 3) return 'Critical';
            if (this.lastBlockTimestamp && 
                Date.now() - this.lastBlockTimestamp > 30000) return 'Warning';
            
            return 'Healthy';
        } catch (error) {
            console.error('Error checking node health:', error);
            return 'Critical';
        }
    }

    async getConnectedPeers() {
        try {
            const netPeers = await this.provider.send('net_peerCount', []);
            return parseInt(netPeers, 16);
        } catch (error) {
            console.error('Error getting connected peers:', error);
            return 0;
        }
    }

    async measureLatency() {
        const start = Date.now();
        try {
            await this.provider.getBlockNumber();
            return Date.now() - start;
        } catch (error) {
            console.error('Error measuring latency:', error);
            return 999;
        }
    }

    updateBlockTimes(block) {
        const timestamp = block.timestamp * 1000;
        if (this.lastBlockTimestamp) {
            const blockTime = timestamp - this.lastBlockTimestamp;
            this.blockTimeHistory.push({
                timestamp,
                time: blockTime / 1000, // Convert to seconds
                blockNumber: block.number
            });

            // Keep last 50 entries
            if (this.blockTimeHistory.length > 50) {
                this.blockTimeHistory.shift();
            }
        }
        this.lastBlockTimestamp = timestamp;
        return this.blockTimeHistory;
    }

    async getFailedRequests() {
        // Implement your failed requests tracking logic
        return 0;
    }

    async getNodeSyncStatus() {
        try {
            const syncStatus = await this.provider.send('eth_syncing', []);
            if (!syncStatus) return 100; // Fully synced

            const currentBlock = parseInt(syncStatus.currentBlock, 16);
            const highestBlock = parseInt(syncStatus.highestBlock, 16);
            return (currentBlock / highestBlock) * 100;
        } catch (error) {
            console.error('Error getting sync status:', error);
            return 0;
        }
    }

    subscribeToNewBlocks(callback) {
        this.provider.on('block', async (blockNumber) => {
            const block = await this.provider.getBlock(blockNumber);
            callback(block);
        });
    }
}

export default NetworkMetricsService; 