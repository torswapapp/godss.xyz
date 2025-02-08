export default class ArbitrageContractService {
    constructor() {
        this.checkOpportunity = jest.fn().mockResolvedValue({
            profitable: true,
            profit: '0.1',
        });
        this.executeArbitrage = jest.fn().mockResolvedValue({
            success: true,
            txHash: '0x123...',
        });
    }
} 