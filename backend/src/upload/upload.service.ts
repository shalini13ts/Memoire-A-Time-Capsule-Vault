import { Injectable } from '@nestjs/common';
import { IpfsService } from '../ipfs/ipfs.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly ipfsService: IpfsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async processUpload(files: Express.Multer.File[], lockTime: string, name: string) {
    const cids: string[] = [];
  
    for (const file of files) {
      const cid = await this.ipfsService.upload(file.buffer);
      cids.push(cid);
    }
  
    console.log('Received lockTime:', lockTime);

    const timestamp = Date.parse(lockTime);
    if (isNaN(timestamp)) {
      throw new Error('Invalid unlock time format.');
    }
    const unlockTimestamp = Math.floor(timestamp / 1000);
    
    const txRequest = await this.blockchainService.createVaultTxRequest(name, cids, unlockTimestamp);
    const { account, ...cleanedTxRequest } = txRequest;
    
    return {
      txRequest: JSON.parse(JSON.stringify(cleanedTxRequest, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )),
      files: files.map((f, i) => ({
        originalName: f.originalname,
        cid: cids[i],
      })),
    };    
  }  
}
