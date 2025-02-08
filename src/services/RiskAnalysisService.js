import { Contract, formatEther } from 'ethers';
import { UNISWAP_V2_PAIR_ABI, SUSHISWAP_PAIR_ABI } from '../constants/abis';

class RiskAnalysisService {
    constructor(provider, flashLoanService) {
        this.provider = provider;
        this.flashLoanService = flashLoanService;
        this.failureHistory = [];
        this.dexExposure = new Map();
    }

    async analyzeLiquidityRisk(token, amount) {
        try {
            const liquidityData = await this.flashLoanService.checkLiquidity(token, amount);
            const availableLiquidity = parseFloat(formatEther(liquidityData.available));
            const requestedAmount = parseFloat(formatEther(amount));
            
            const riskScore = Math.min(100, (requestedAmount / availableLiquidity) * 100);
            
            return {
                riskScore,
                available: availableLiquidity,
                requested: requestedAmount,
                isViable: liquidityData.isEnough
            };
        } catch (error) {
            console.error('Error analyzing liquidity risk:', error);
            return { riskScore: 100, isViable: false };
        }
    }

    async analyzeVolatilityRisk(token, timeframe = '1h') {
        try {
            const prices = await this.getPriceHistory(token, timeframe);
            const volatility = this.calculateVolatility(prices);
            
            // Convert volatility to risk score (0-100)
            const riskScore = Math.min(100, volatility * 100);
            
            return {
                riskScore,
                volatility,
                timeframe,
                priceData: prices
            };
        } catch (error) {
            console.error('Error analyzing volatility risk:', error);
            return { riskScore: 50, volatility: 0 };
        }
    }

    async analyzeContractRisk(contractAddress) {
        try {
            // Analyze contract verification status, age, activity
            const [code, history] = await Promise.all([
                this.provider.getCode(contractAddress),
                this.getContractHistory(contractAddress)
            ]);

            const riskFactors = {
                isVerified: await this.checkVerificationStatus(contractAddress),
                age: history.age,
                activityLevel: history.activityLevel,
                codeSize: code.length
            };

            const riskScore = this.calculateContractRiskScore(riskFactors);
            
            return {
                riskScore,
                factors: riskFactors
            };
        } catch (error) {
            console.error('Error analyzing contract risk:', error);
            return { riskScore: 75 };
        }
    }

    calculateImpermanentLossRisk(priceChange) {
        // IL = 2√(P) - (1 + P), where P is price ratio
        const priceRatio = 1 + (priceChange / 100);
        const il = (2 * Math.sqrt(priceRatio)) - (1 + priceRatio);
        return Math.abs(il * 100);
    }

    calculateOverallRisk(risks) {
        const weights = {
            liquidity: 0.3,
            volatility: 0.25,
            impermanentLoss: 0.2,
            contract: 0.25
        };

        return Object.entries(risks).reduce((total, [key, value]) => 
            total + (value * weights[key]), 0);
    }

    async getRecentFailures() {
        return this.failureHistory.slice(-10).map(failure => ({
            ...failure,
            timestamp: new Date(failure.timestamp).toISOString()
        }));
    }

    async getExposureByDex() {
        const exposureData = Array.from(this.dexExposure.entries())
            .map(([name, value]) => ({ name, value }));
        
        const total = exposureData.reduce((sum, item) => sum + item.value, 0);
        
        return exposureData.map(item => ({
            ...item,
            value: (item.value / total) * 100
        }));
    }

    async getHistoricalSuccess() {
        // Implementation for historical success rate
        return [];
    }

    logFailure(failure) {
        this.failureHistory.push({
            ...failure,
            timestamp: Date.now()
        });

        if (this.failureHistory.length > 100) {
            this.failureHistory.shift();
        }
    }

    updateDexExposure(dex, amount) {
        const current = this.dexExposure.get(dex) || 0;
        this.dexExposure.set(dex, current + amount);
    }
}

export default RiskAnalysisService; 