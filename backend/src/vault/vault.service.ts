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

  async streamFilesFromTx(txHash: string, res: Response) {
    const cids = await this.blockchainService.getVaultFilesFromTx(txHash as `0x${string}`);

    if (!cids.length) {
      throw new NotFoundException('No files found in this vault.');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="vault-files.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (let i = 0; i < cids.length; i++) {
      const cid = cids[i];
      try {
        const fileResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
          responseType: 'stream',
        });
        archive.append(fileResponse.data, { name: `file-${i + 1}` });
      } catch (err) {
        console.warn(`Failed to retrieve CID ${cid}: ${err}`);
      }
    }

    await archive.finalize();
  }

  async getRetrieveTxRequest(vaultId: string) {
    return this.blockchainService.createRetrieveVaultTxRequest(vaultId as `0x${string}`);
  }

  async getCidsFromTx(txHash: string): Promise<string[]> {
    return this.blockchainService.getVaultFilesFromTx(txHash as `0x${string}`);
  }  
}
