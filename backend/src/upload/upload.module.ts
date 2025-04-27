import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  controllers: [UploadController],
  providers: [UploadService, IpfsService],
})
export class UploadModule {}
