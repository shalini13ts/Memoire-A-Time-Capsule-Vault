import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import * as archiver from 'archiver';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class VaultService {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getVaultStatus(vaultId: string) {
    const { isOpen, unlockTime } = await this.blockchainService.getVaultStatus(vaultId as `0x${string}`);
    return {
      isOpen,
      unlockTime: unlockTime.toString(),
    };
  }

  async getRetrieveTxRequest(vaultId: string) {
    return this.blockchainService.createRetrieveVaultTxRequest(vaultId as `0x${string}`);
  }

  async getCidsFromTx(txHash: string): Promise<string[]> {
    return this.blockchainService.getVaultFilesFromTx(txHash as `0x${string}`);
  }  
}
