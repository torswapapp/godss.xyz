import { BrowserProvider } from 'ethers';

class WalletService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        if (window.ethereum) {
            // Metamask or other web3 wallet
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.provider = new BrowserProvider(window.ethereum);
                this.wallet = this.provider.getSigner();
                this.isInitialized = true;
            } catch (error) {
                console.error('User rejected wallet connection');
                throw error;
            }
        } else {
            throw new Error('No Web3 wallet detected');
        }
    }

    async getAddress() {
        await this.initialize();
        return await this.wallet.getAddress();
    }

    async signMessage(message) {
        await this.initialize();
        return await this.wallet.signMessage(message);
    }

    async sendTransaction(transaction) {
        await this.initialize();
        return await this.wallet.sendTransaction(transaction);
    }

    async connect() {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            return provider;
        }
        throw new Error('Please install MetaMask');
    }
}

const walletService = new WalletService();
export default walletService; 