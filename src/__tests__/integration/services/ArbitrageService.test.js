import ArbitrageContractService from '../../../services/ArbitrageContractService';
import { ethers } from 'ethers';

describe('ArbitrageContractService', () => {
    let service;
    let provider;

    beforeEach(() => {
        provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL);
        service = new ArbitrageContractService(provider);
    });

    test('checks arbitrage opportunity', async () => {
        const result = await service.checkOpportunity(
            '0xTokenA',
            '0xTokenB',
            ethers.utils.parseEther('1.0')
        );
        expect(result).toHaveProperty('profitable');
        expect(result).toHaveProperty('profit');
    });
}); 