import { developmentConfig } from './config.development';
import { productionConfig } from './config.production';

const envConfig = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;

export const config = {
    ...envConfig,
    provider: {
        infura: process.env.REACT_APP_INFURA_API_KEY,
        alchemy: process.env.REACT_APP_ALCHEMY_API_KEY,
        wsUrl: process.env.REACT_APP_WS_PROVIDER_URL
    },
    contracts: {
        arbitrage: process.env.REACT_APP_ARBITRAGE_CONTRACT_ADDRESS,
        aavePool: process.env.REACT_APP_AAVE_POOL_ADDRESS,
        aaveProvider: process.env.REACT_APP_AAVE_ADDRESSES_PROVIDER
    },
    dex: {
        uniswapV2: process.env.REACT_APP_UNISWAP_V2_ROUTER,
        uniswapV3: process.env.REACT_APP_UNISWAP_V3_ROUTER,
        sushiswap: process.env.REACT_APP_SUSHISWAP_ROUTER
    },
    security: {
        maxGasPrice: process.env.REACT_APP_MAX_GAS_PRICE,
        minProfitThreshold: process.env.REACT_APP_MIN_PROFIT_THRESHOLD
    }
}; 