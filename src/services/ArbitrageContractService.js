import { 
    Contract, 
    formatEther, 
    parseEther, 
    formatUnits
} from 'ethers';
import FlashLoanService from './FlashLoanService';
import RateLimitService from './RateLimitService';
import WalletService from './WalletService';
import ErrorHandlingService from './ErrorHandlingService';
import RequestSigningService from './RequestSigningService';
import MonitoringService from './MonitoringService';

const ABI = [{"inputs":[{"internalType":"address","name":"_addressProvider","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenBorrow","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"profit","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"dexPath","type":"address[]"}],"name":"ArbitrageExecuted","type":"event"}]; // Your full ABI here

const CONTRACT_ADDRESS = process.env.REACT_APP_ARBITRAGE_CONTRACT_ADDRESS;

class ArbitrageContractService {
    constructor(provider) {
        this.provider = provider;
        this.contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
        this.initializeWallet();
        this.flashLoanService = new FlashLoanService(provider);
    }

    async initializeWallet() {
        await WalletService.initialize();
        this.signer = WalletService.wallet;
        this.contractWithSigner = this.contract.connect(this.signer);
    }

    async checkOpportunity(tokenA, tokenB, amount) {
        try {
            const result = await this.contract.checkArbitrageOpportunity(
                tokenA,
                tokenB,
                parseEther(amount.toString())
            );
            return {
                profitable: result.profitable,
                profit: formatEther(result.profit)
            };
        } catch (error) {
            console.error('Error checking opportunity:', error);
            return { profitable: false, profit: '0' };
        }
    }

    async executeArbitrage(amount, path, data) {
        const tradeMonitor = MonitoringService.startTradeMonitoring(
            `trade_${Date.now()}`
        );

        try {
            tradeMonitor.log('started', { amount, path });
            
            await RateLimitService.waitForAvailability('arbitrage');
            tradeMonitor.log('rate_limit_checked');
            
            const signedData = await RequestSigningService.signRequest({
                amount,
                path,
                data,
                timestamp: Date.now()
            });
            tradeMonitor.log('request_signed');

            const tx = await this.contractWithSigner.executeArbitrage(
                parseEther(amount.toString()),
                path,
                signedData,
                {
                    gasLimit: 500000,
                    maxFeePerGas: formatUnits(
                        process.env.REACT_APP_MAX_GAS_PRICE,
                        'gwei'
                    )
                }
            );
            tradeMonitor.log('transaction_sent', { 
                hash: tx.hash 
            });

            const receipt = await tx.wait();
            
            const tradeData = {
                amount,
                profit: receipt.events[0].args.profit.toString(),
                gasUsed: receipt.gasUsed.toString(),
                path
            };
            
            MonitoringService.logTradeExecution(tradeData);
            tradeMonitor.log('completed', tradeData);

            return receipt;
        } catch (error) {
            tradeMonitor.log('failed', { error: error.message });
            return ErrorHandlingService.handleError(error, {
                method: 'executeArbitrage',
                params: { amount, path, data }
            });
        }
    }

    async getContractStats() {
        const [
            minProfit,
            maxBorrow,
            maxImpact,
            isPaused,
            lastTrade
        ] = await Promise.all([
            this.contract.minProfitThreshold(),
            this.contract.maxBorrowAmount(),
            this.contract.maxPriceImpact(),
            this.contract.isPaused(),
            this.contract.lastTradeTimestamp()
        ]);

        return {
            minProfitThreshold: formatEther(minProfit),
            maxBorrowAmount: formatEther(maxBorrow),
            maxPriceImpact: maxImpact.toString(),
            isPaused,
            lastTradeTimestamp: lastTrade.toString()
        };
    }

    async validateAndPrepareArbitrage(opportunity) {
        try {
            const flashLoanValidation = await this.flashLoanService
                .validateFlashLoanParameters(
                    opportunity.tokenBorrow,
                    opportunity.amount
                );

            if (!flashLoanValidation.isValid) {
                throw new Error(`Insufficient flash loan liquidity. Max available: ${flashLoanValidation.maxAvailable}`);
            }

            const estimatedProfit = await this.checkOpportunity(
                opportunity.tokenBorrow,
                opportunity.tokenTarget,
                opportunity.amount
            );

            const flashLoanFee = flashLoanValidation.fee;
            const netProfit = parseEther(estimatedProfit.profit)
                .sub(parseEther(flashLoanFee));

            return {
                ...opportunity,
                flashLoanFee,
                netProfit: formatEther(netProfit),
                isViable: netProfit.gt(0)
            };
        } catch (error) {
            return ErrorHandlingService.handleError(error, {
                method: 'validateAndPrepareArbitrage',
                opportunity
            });
        }
    }
}

export default ArbitrageContractService; 