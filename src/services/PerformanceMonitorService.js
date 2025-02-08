class PerformanceMonitorService {
    constructor() {
        this.metrics = {
            executionTimes: [],
            successfulTrades: 0,
            totalTrades: 0,
            gasUsage: [],
            errors: new Map()
        };
        this.thresholds = {
            maxExecutionTime: 2000, // 2 seconds
            minSuccessRate: 90, // 90%
            maxGasUsage: 500000 // gas units
        };
    }

    recordTradeExecution(duration, success, gasUsed) {
        this.metrics.executionTimes.push(duration);
        this.metrics.totalTrades++;
        if (success) this.metrics.successfulTrades++;
        this.metrics.gasUsage.push(gasUsed);

        // Keep only last 100 records
        if (this.metrics.executionTimes.length > 100) {
            this.metrics.executionTimes.shift();
            this.metrics.gasUsage.shift();
        }
    }

    recordError(type, error) {
        const count = this.metrics.errors.get(type) || 0;
        this.metrics.errors.set(type, count + 1);
    }

    getAverageExecutionTime() {
        if (this.metrics.executionTimes.length === 0) return 0;
        const sum = this.metrics.executionTimes.reduce((a, b) => a + b, 0);
        return sum / this.metrics.executionTimes.length;
    }

    getSuccessRate() {
        if (this.metrics.totalTrades === 0) return 100;
        return (this.metrics.successfulTrades / this.metrics.totalTrades) * 100;
    }

    getAverageGasUsage() {
        if (this.metrics.gasUsage.length === 0) return 0;
        const sum = this.metrics.gasUsage.reduce((a, b) => a + b, 0);
        return sum / this.metrics.gasUsage.length;
    }

    getPerformanceReport() {
        const avgExecutionTime = this.getAverageExecutionTime();
        const successRate = this.getSuccessRate();
        const avgGasUsage = this.getAverageGasUsage();

        return {
            metrics: {
                averageExecutionTime: avgExecutionTime,
                successRate: successRate,
                averageGasUsage: avgGasUsage
            },
            status: {
                execution: avgExecutionTime < this.thresholds.maxExecutionTime ? 'optimal' : 'needs_optimization',
                success: successRate > this.thresholds.minSuccessRate ? 'good' : 'needs_improvement',
                gas: avgGasUsage < this.thresholds.maxGasUsage ? 'efficient' : 'high'
            },
            recommendations: this.generateRecommendations({
                avgExecutionTime,
                successRate,
                avgGasUsage
            })
        };
    }

    generateRecommendations({ avgExecutionTime, successRate, avgGasUsage }) {
        const recommendations = [];

        if (avgExecutionTime >= this.thresholds.maxExecutionTime) {
            recommendations.push({
                type: 'execution_time',
                priority: 'high',
                message: 'Consider increasing gas price for faster execution'
            });
        }

        if (successRate <= this.thresholds.minSuccessRate) {
            recommendations.push({
                type: 'success_rate',
                priority: 'high',
                message: 'Review slippage tolerance and gas settings'
            });
        }

        if (avgGasUsage >= this.thresholds.maxGasUsage) {
            recommendations.push({
                type: 'gas_usage',
                priority: 'medium',
                message: 'Optimize transaction path for lower gas usage'
            });
        }

        return recommendations;
    }
}

export default new PerformanceMonitorService();