import { 
    Contract, 
    formatEther, 
    parseEther, 
} from 'ethers';

const AAVE_ADDRESSES = {
    V3_POOL_ADDRESSES_PROVIDER: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', // Mainnet
    V3_POOL: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',  // Mainnet
};

class FlashLoanService {
    constructor(provider) {
        this.provider = provider;
        this.signer = provider.getSigner();
    }

    async calculateFlashLoanFee(amount) {
        // Aave V3 flash loan fee is 0.09%
        const FEE_FACTOR = 0.0009;
        return parseEther((amount * FEE_FACTOR).toString());
    }

    async validateFlashLoanParameters(tokenAddress, amount) {
        try {
            // Check token liquidity in Aave
            const poolContract = new Contract(
                AAVE_ADDRESSES.V3_POOL,
                ['function getReserveData(address) view returns (tuple(uint256,uint256))'],
                this.provider
            );

            const reserveData = await poolContract.getReserveData(tokenAddress);
            const availableLiquidity = reserveData[0];

            return {
                isValid: availableLiquidity.gte(parseEther(amount.toString())),
                maxAvailable: formatEther(availableLiquidity),
                fee: await this.calculateFlashLoanFee(amount)
            };
        } catch (error) {
            console.error('Error validating flash loan:', error);
            return { isValid: false, maxAvailable: '0', fee: '0' };
        }
    }

    getFlashLoanProviders() {
        return [
            {
                name: 'Aave V3',
                address: AAVE_ADDRESSES.V3_POOL,
                maxTokens: 'Unlimited',
                fee: '0.09%',
                active: true
            }
        ];
    }
}

export default FlashLoanService; 