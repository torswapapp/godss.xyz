import { 
    randomBytes,
    id,
    verifyMessage,
    solidityPackedKeccak256
} from 'ethers';
import WalletService from './WalletService';

class RequestSigningService {
    constructor() {
        this.nonceMap = new Map();
    }

    generateNonce() {
        return randomBytes(16).toString('hex');
    }

    async signRequest(data) {
        const timestamp = Date.now();
        const nonce = this.generateNonce();
        
        const messageHash = solidityPackedKeccak256(
            ['string', 'uint256', 'bytes32'],
            [JSON.stringify(data), timestamp, nonce]
        );
        const signature = await WalletService.signMessage(messageHash);

        return {
            timestamp,
            nonce,
            signature,
            data
        };
    }

    createSignMessage(data, timestamp, nonce) {
        const ordered = Object.keys(data)
            .sort()
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});

        return id(
            JSON.stringify(ordered) + timestamp + nonce
        );
    }

    verifySignature(data, timestamp, nonce, signature) {
        // Verify timestamp is within 5 minutes
        if (Date.now() - timestamp > 5 * 60 * 1000) {
            throw new Error('Request expired');
        }

        // Verify nonce hasn't been used
        if (this.nonceMap.has(nonce)) {
            throw new Error('Nonce already used');
        }

        // Store nonce
        this.nonceMap.set(nonce, timestamp);

        // Clean up old nonces
        this.cleanupNonces();

        const message = this.createSignMessage(data, timestamp, nonce);
        const recoveredAddress = verifyMessage(message, signature);

        return recoveredAddress.toLowerCase() === WalletService.getAddress().toLowerCase();
    }

    cleanupNonces() {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        for (const [nonce, timestamp] of this.nonceMap.entries()) {
            if (timestamp < fiveMinutesAgo) {
                this.nonceMap.delete(nonce);
            }
        }
    }
}

const requestSigningService = new RequestSigningService();
export default requestSigningService; 