import { Injectable, Logger } from '@nestjs/common';
import { createWalletClient, createPublicClient, http, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import * as abi from '../abi/memoireVault.json';

const memoireVaultAbi = abi as readonly unknown[];

dotenv.config();

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly vaultAddress = process.env.VAULT_CONTRACT_ADDRESS!;

  private account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

  private walletClient = createWalletClient({
    account: this.account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
  });

  private publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
  });

  async createVaultTxRequest(name: string, cids: string[], unlockTime: number) {
    const { request } = await this.publicClient.simulateContract({
      account: this.account,
      address: this.vaultAddress as `0x${string}`,
      abi: memoireVaultAbi,
      functionName: 'createVault',
      args: [name, cids, BigInt(unlockTime)],
    });
  
    return request;
  }  

  async getVaultStatus(vaultId: `0x${string}`): Promise<{ isOpen: boolean; unlockTime: bigint }> {
    const result = await this.publicClient.readContract({
      address: this.vaultAddress as `0x${string}`,
      abi: memoireVaultAbi,
      functionName: 'getVaultStatus',
      args: [vaultId],
    });

    const [isOpen, unlockTime] = result as [boolean, bigint];
    return { isOpen, unlockTime };
  }

  async createRetrieveVaultTxRequest(vaultId: `0x${string}`) {
    const { request } = await this.publicClient.simulateContract({
      account: this.account,
      address: this.vaultAddress as `0x${string}`,
      abi: memoireVaultAbi,
      functionName: 'retrieveVault',
      args: [vaultId],
    });
  
    const { account, ...cleanedRequest } = request;
    return JSON.parse(JSON.stringify(cleanedRequest, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  async getVaultFilesFromTx(txHash: `0x${string}`): Promise<string[]> {
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    const decodedLogs = receipt.logs.map(log => {
      try {
        return decodeEventLog({
          abi: memoireVaultAbi,
          eventName: 'VaultRetrieved',
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    });

    const event = decodedLogs.find(e => e?.eventName === 'VaultRetrieved');
    return (event?.args as any)?.cids || [];
  }
}
