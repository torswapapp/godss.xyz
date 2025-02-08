import { Contract, formatEther } from 'ethers';

class AdvancedAnalyticsService {
    constructor(provider) {
        this.provider = provider;
        this.priceHistory = new Map();
        this.volatilityData = new Map();
        this.liquidityHistory = new Map();
        this.gasHistory = [];
    }

    // Price Correlation Analysis
    async analyzePriceCorrelation(token0, token1, timeframe = '24h') {
        const prices0 = await this.getPriceHistory(token0);
        const prices1 = await this.getPriceHistory(token1);
        
        return {
            correlation: this.calculateCorrelation(prices0, prices1),
            priceRatio: this.calculatePriceRatio(prices0, prices1),
            trendAnalysis: this.analyzeTrend(prices0, prices1)
        };
    }

    // Volatility Monitoring
    async monitorVolatility(tokenAddress) {
        const prices = await this.getPriceHistory(tokenAddress);
        const volatility = {
            hourly: this.calculateVolatility(prices, '1h'),
            daily: this.calculateVolatility(prices, '24h'),
            weekly: this.calculateVolatility(prices, '7d')
        };

        this.volatilityData.set(tokenAddress, volatility);
        return volatility;
    }

    // Liquidity Analysis
    async analyzeLiquidityDepth(pairAddress) {
        const pair = new Contract(
            pairAddress,
            ['function getReserves() external view returns (uint112, uint112, uint32)'],
            this.provider
        );

        const reserves = await pair.getReserves();
        return {
            token0Liquidity: reserves[0].toString(),
            token1Liquidity: reserves[1].toString(),
            liquidityScore: this.calculateLiquidityScore(reserves[0], reserves[1]),
            slippageImpact: this.calculateSlippageImpact(reserves[0], reserves[1])
        };
    }

    // Gas Optimization
    async optimizeGas() {
        const block = await this.provider.getBlock('latest');
        const historicalGas = await this.getHistoricalGasPrices();
        
        return {
            recommendedGasPrice: this.calculateOptimalGasPrice(historicalGas),
            bestTimeToExecute: this.findOptimalExecutionTime(historicalGas),
            gasTrend: this.analyzeGasTrend(historicalGas)
        };
    }

    // Helper Methods
    calculateCorrelation(prices1, prices2) {
        // Pearson correlation coefficient calculation
        const n = Math.min(prices1.length, prices2.length);
        let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

        for (let i = 0; i < n; i++) {
            sum1 += prices1[i];
            sum2 += prices2[i];
            sum1Sq += prices1[i] ** 2;
            sum2Sq += prices2[i] ** 2;
            pSum += prices1[i] * prices2[i];
        }

        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));
        return num / den;
    }

    calculateVolatility(prices, timeframe) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
        return Math.sqrt(variance);
    }

    calculateLiquidityScore(reserve0, reserve1) {
        const totalLiquidity = parseFloat(formatEther(reserve0)) * 
                              parseFloat(formatEther(reserve1));
        // Score from 0-100 based on liquidity depth
        return Math.min(100, Math.log10(totalLiquidity) * 10);
    }

    calculateSlippageImpact(reserve0, reserve1) {
        return {
            small: this.calculateSlippageForAmount(reserve0, reserve1, '1'),
            medium: this.calculateSlippageForAmount(reserve0, reserve1, '10'),
            large: this.calculateSlippageForAmount(reserve0, reserve1, '100')
        };
    }

    calculateOptimalGasPrice(historicalGas) {
        const sorted = [...historicalGas].sort((a, b) => a.gasPrice - b.gasPrice);
        const percentile25 = sorted[Math.floor(sorted.length * 0.25)];
        const median = sorted[Math.floor(sorted.length * 0.5)];
        const percentile75 = sorted[Math.floor(sorted.length * 0.75)];

        return {
            safe: percentile75.gasPrice,
            standard: median.gasPrice,
            economic: percentile25.gasPrice
        };
    }

    async getLatestBlockData() {
        const block = await this.provider.getBlock('latest');
        return {
            number: block.number,
            timestamp: block.timestamp,
            gasUsed: block.gasUsed.toString()
        };
    }
}

export default AdvancedAnalyticsService; 