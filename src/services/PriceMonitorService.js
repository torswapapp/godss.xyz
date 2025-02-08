import { Contract } from 'ethers';

class PriceMonitorService {
    constructor(provider) {
        this.provider = provider;
        this.PAIR_ABI = [
            'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
        ];
    }

    async monitorPair(token0, token1, pairs) {
        try {
            const pairContracts = pairs.map((pair, index) => ({
                contract: new Contract(pair.pairAddress, this.PAIR_ABI, this.provider),
                name: pair.name
            }));

            for (const { contract, name } of pairContracts) {
                contract.on('Swap', async (...args) => {
                    const reserves = await contract.getReserves();
                    const price = this.calculatePrice(reserves[0], reserves[1]);
                    this.updatePrice(token0, token1, name, price);
                });
            }
        } catch (error) {
            console.error('Monitor pair error:', error);
            throw error;
        }
    }

    calculateArbitrageProfitability(prices) {
        // Calculate potential profit across different DEXes
        // Return profitability metrics
    }

    async checkArbitrageOpportunity(tokenA, tokenB, amount) {
        const opportunity = await this.contractService.checkOpportunity(
            tokenA,
            tokenB,
            amount
        );

        if (opportunity.profitable) {
            const estimatedGas = await this.contractService.contract.estimateGasCost(
                [tokenA, tokenB],
                []
            );
            
            return {
                ...opportunity,
                estimatedGas: estimatedGas.toString(),
                netProfit: parseFloat(opportunity.profit) - parseFloat(estimatedGas)
            };
        }

        return opportunity;
    }
}

export default PriceMonitorService; 