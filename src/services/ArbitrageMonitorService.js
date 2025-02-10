import { Contract, formatEther, formatUnits } from 'ethers';
import monitoringService from './MonitoringService';
import FlashLoanService from './FlashLoanService';
import WebSocketManager from './WebSocketManager';
import CircuitBreakerService from './CircuitBreakerService';

class ArbitrageMonitorService {
    constructor() {
        this.provider = null;
        this.flashLoanService = new FlashLoanService(this.provider);
        this.isMonitoring = false;
        this.minProfitThreshold = parseFloat(process.env.REACT_APP_MIN_PROFIT_THRESHOLD);
        this.opportunities = new Map();
        this.lastBlockNumber = 0;
        this.manualOpportunities = [];
        this.subscribers = new Set();
    }

    async initialize() {
        this.provider = await WebSocketManager.connect();
        await this.setupMonitoring();
    }

    async setupMonitoring() {
        // Monitor blocks
        this.provider.on('block', this.handleNewBlock.bind(this));
        
        // Monitor gas prices
        setInterval(this.monitorGasPrice.bind(this), 10000);
        
        // Monitor network congestion
        setInterval(this.monitorNetworkCongestion.bind(this), 30000);
    }

    async handleNewBlock(blockNumber) {
        try {
            // Check if we missed any blocks
            if (this.lastBlockNumber && blockNumber > this.lastBlockNumber + 1) {
                monitoringService.trackUserAction('missed_blocks', {
                    missed: blockNumber - this.lastBlockNumber - 1
                });
            }
            this.lastBlockNumber = blockNumber;

            // Check circuit breakers before processing
            const activeBreakers = CircuitBreakerService.checkAllBreakers();
            if (activeBreakers.length > 0) {
                return; // Skip if any breakers are active
            }

            const opportunities = await this.findArbitrageOpportunities();
            await this.processOpportunities(opportunities);

        } catch (error) {
            monitoringService.logError(error, {
                service: 'ArbitrageMonitor',
                method: 'handleNewBlock',
                blockNumber
            });
        }
    }

    async monitorGasPrice() {
        const gasPrice = await this.provider.getGasPrice();
        const gasPriceGwei = parseFloat(formatUnits(gasPrice, 'gwei'));
        
        CircuitBreakerService.checkGasPrice(gasPriceGwei);
        
        monitoringService.trackUserAction('gas_price_update', {
            gasPrice: gasPriceGwei
        });
    }

    async monitorNetworkCongestion() {
        const block = await this.provider.getBlock('latest');
        const congestion = (block.gasUsed / block.gasLimit) * 100;
        
        CircuitBreakerService.checkNetworkCongestion(congestion);
        
        monitoringService.trackUserAction('network_congestion_update', {
            congestion
        });
    }

    async processOpportunities(opportunities) {
        for (const opp of opportunities) {
            if (!CircuitBreakerService.checkProfitability(opp.profit)) {
                continue;
            }

            if (!CircuitBreakerService.checkLiquidity(opp.liquidity)) {
                continue;
            }

            await this.executeArbitrage(opp);
        }
    }

    async findArbitrageOpportunities() {
        const opportunities = await super.findArbitrageOpportunities();
        
        opportunities.forEach(opp => {
            if (opp.netProfit > this.minProfitThreshold) {
                this.manualOpportunities.push({
                    ...opp,
                    timestamp: Date.now(),
                    id: `${Date.now()}-${Math.random()}`
                });
                this.notifySubscribers({ 
                    type: 'newOpportunity', 
                    data: opp 
                });
            }
        });

        // Keep only recent opportunities
        this.manualOpportunities = this.manualOpportunities
            .filter(opp => Date.now() - opp.timestamp < 300000); // 5 minutes

        return opportunities;
    }

    async executeArbitrage(opportunity) {
        try {
            // Prepare flash loan parameters
            const flashLoanParams = await this.flashLoanService.prepareFlashLoan({
                token: opportunity.path[0],
                amount: opportunity.amount,
                path: opportunity.path,
                exchanges: opportunity.exchanges
            });

            // Execute flash loan
            const tx = await this.flashLoanService.executeFlashLoan(flashLoanParams);
            const receipt = await tx.wait();

            monitoringService.trackFlashLoanExecution({
                ...opportunity,
                success: true,
                blockNumber: receipt.blockNumber,
                txHash: receipt.transactionHash,
                gasUsed: receipt.gasUsed.toString()
            });

        } catch (error) {
            monitoringService.logError(error, {
                service: 'ArbitrageMonitorService',
                method: 'executeArbitrage',
                opportunity
            });
        }
    }

    async startMonitoring() {
        if (this.isMonitoring) return;
        
        try {
            await this.initialize();
            this.isMonitoring = true;
            monitoringService.trackUserAction('monitoring_started');
            this.notifySubscribers({ type: 'status', data: 'started' });
        } catch (error) {
            monitoringService.logError(error, {
                service: 'ArbitrageMonitor',
                method: 'startMonitoring'
            });
            throw error;
        }
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.provider?.removeAllListeners('block');
        clearInterval(this.gasMonitorInterval);
        clearInterval(this.congestionMonitorInterval);
        monitoringService.trackUserAction('monitoring_stopped');
        this.notifySubscribers({ type: 'status', data: 'stopped' });
    }

    async executeManualTrade(opportunity) {
        if (!CircuitBreakerService.checkAllBreakers()) {
            throw new Error('Circuit breakers are active');
        }

        try {
            monitoringService.trackUserAction('manual_trade_started', opportunity);
            const result = await this.executeArbitrage(opportunity);
            this.notifySubscribers({ 
                type: 'tradeResult', 
                data: { opportunity, result } 
            });
            return result;
        } catch (error) {
            monitoringService.logError(error, {
                service: 'ArbitrageMonitor',
                method: 'executeManualTrade',
                opportunity
            });
            throw error;
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    unsubscribe(callback) {
        this.subscribers.delete(callback);
    }

    notifySubscribers(data) {
        this.subscribers.forEach(callback => callback(data));
    }

    getManualOpportunities() {
        return this.manualOpportunities;
    }
}

export default ArbitrageMonitorService; 