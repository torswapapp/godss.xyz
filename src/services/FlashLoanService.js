import { 
    Contract, 
    formatEther, 
    parseEther, 
} from 'ethers';
import { AAVE_POOL_ABI } from '../constants/aavePoolAbi';
import ARBITRAGE_ABI from '../constants/arbitrageAbi';

const AAVE_ADDRESSES = {
    V3_POOL_ADDRESSES_PROVIDER: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', // Mainnet
    V3_POOL: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',  // Mainnet
};

class FlashLoanService {
    constructor(provider) {
        this.provider = provider;
        this.signer = provider.getSigner();
        this.aavePool = new Contract(
            process.env.REACT_APP_AAVE_POOL_ADDRESS,
            AAVE_POOL_ABI,
            provider
        );
        this.arbitrageContract = new Contract(
            process.env.REACT_APP_ARBITRAGE_CONTRACT_ADDRESS,
            ARBITRAGE_ABI,
            provider
        );
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

    async executeFlashLoan(params) {
        try {
            const tx = await this.arbitrageContract.executeArbitrage(
                params.amount,
                params.path,
                params.data,
                {
                    gasLimit: 500000,
                    gasPrice: params.gasPrice
                }
            );
            return tx;
        } catch (error) {
            console.error('Flash loan execution error:', error);
            throw error;
        }
    }

    async checkLiquidity(token, amount) {
        try {
            const liquidity = await this.aavePool.getReserveData(token);
            return {
                available: liquidity.availableLiquidity,
                isEnough: liquidity.availableLiquidity.gte(amount)
            };
        } catch (error) {
            console.error('Liquidity check error:', error);
            throw error;
        }
    }
}

export default FlashLoanService; 