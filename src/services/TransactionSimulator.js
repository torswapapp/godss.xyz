import { ethers } from 'ethers';

class TransactionSimulator {
    constructor(provider) {
        this.provider = provider;
    }

    async simulateTransaction(transaction) {
        try {
            // Create a fork of the current state
            const blockNumber = await this.provider.getBlockNumber();
            const block = await this.provider.getBlock(blockNumber);

            // Simulate the transaction
            const result = await this.provider.call({
                ...transaction,
                from: transaction.from,
                to: transaction.to,
                value: transaction.value,
                data: transaction.data,
                gasLimit: transaction.gasLimit,
            }, blockNumber);

            // Estimate the impact
            const gasEstimate = await this.provider.estimateGas(transaction);
            const gasPrice = await this.provider.getGasPrice();
            const gasCost = gasEstimate.mul(gasPrice);

            return {
                success: true,
                result,
                gasEstimate: gasEstimate.toString(),
                gasCost: ethers.utils.formatEther(gasCost),
                timestamp: block.timestamp,
                blockNumber,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                reason: this.decodeError(error),
            };
        }
    }

    decodeError(error) {
        // Decode common EVM errors
        const errorSignatures = {
            'revert': 'Transaction would revert',
            'outOfGas': 'Transaction would run out of gas',
            'undefined': 'Unexpected error during simulation',
        };

        for (const [key, value] of Object.entries(errorSignatures)) {
            if (error.message.includes(key)) {
                return value;
            }
        }

        return 'Unknown error during simulation';
    }
}

export default TransactionSimulator; 