import { formatEther } from 'ethers';

class HistoricalPerformanceService {
    constructor(provider) {
        this.provider = provider;
        this.trades = [];
    }

    async trackTrade(trade) {
        const tradeData = {
            ...trade,
            timestamp: Date.now(),
            gasUsed: trade.receipt.gasUsed.toString(),
            status: trade.receipt.status ? 'Success' : 'Failed'
        };
        
        this.trades.push(tradeData);
        await this.saveTrade(tradeData);
        return this.calculateMetrics();
    }

    calculateMetrics() {
        const metrics = {
            totalTrades: this.trades.length,
            successRate: this.calculateSuccessRate(),
            profitPatterns: this.analyzeProfitPatterns(),
            averageProfit: this.calculateAverageProfit(),
            totalProfit: this.calculateTotalProfit(),
            bestPerformingPairs: this.findBestPerformingPairs(),
            timeBasedAnalysis: this.analyzeTimePatterns()
        };
        
        return metrics;
    }

    calculateSuccessRate() {
        const successfulTrades = this.trades.filter(trade => trade.status === 'Success');
        return (successfulTrades.length / this.trades.length) * 100;
    }

    analyzeProfitPatterns() {
        return {
            hourly: this.groupProfitsByTimeframe('hour'),
            daily: this.groupProfitsByTimeframe('day'),
            weekly: this.groupProfitsByTimeframe('week')
        };
    }

    findBestPerformingPairs() {
        const pairPerformance = {};
        this.trades.forEach(trade => {
            const pair = `${trade.token0}-${trade.token1}`;
            if (!pairPerformance[pair]) {
                pairPerformance[pair] = {
                    totalProfit: 0,
                    tradeCount: 0,
                    successCount: 0
                };
            }
            pairPerformance[pair].tradeCount++;
            if (trade.status === 'Success') {
                pairPerformance[pair].successCount++;
                pairPerformance[pair].totalProfit += parseFloat(trade.profit);
            }
        });
        return pairPerformance;
    }

    generateReport() {
        const metrics = this.calculateMetrics();
        return {
            summary: {
                totalTrades: metrics.totalTrades,
                successRate: `${metrics.successRate.toFixed(2)}%`,
                totalProfit: `${metrics.totalProfit.toFixed(4)} ETH`,
                averageProfit: `${metrics.averageProfit.toFixed(4)} ETH`
            },
            profitPatterns: metrics.profitPatterns,
            bestPairs: metrics.bestPerformingPairs,
            timeAnalysis: metrics.timeBasedAnalysis
        };
    }

    async saveTrade(tradeData) {
        // Save to local storage or database
        const trades = JSON.parse(localStorage.getItem('trades') || '[]');
        trades.push(tradeData);
        localStorage.setItem('trades', JSON.stringify(trades));
    }

    calculateTotalProfit() {
        return formatEther(this.trades.reduce((total, trade) => 
            total.add(trade.profit), 0));
    }
}

export default HistoricalPerformanceService; 