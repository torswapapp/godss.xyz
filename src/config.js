export const config = {
    INFURA_API_KEY: process.env.REACT_APP_INFURA_API_KEY,
    NETWORK: process.env.REACT_APP_NETWORK || 'mainnet',
    MAX_GAS_PRICE: process.env.REACT_APP_MAX_GAS_PRICE || '100',
    CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS,
    MIN_PROFIT_THRESHOLD: process.env.REACT_APP_MIN_PROFIT_THRESHOLD || '0.01'
}; 