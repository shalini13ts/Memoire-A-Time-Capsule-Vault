import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { AppController } from './app.controller';
import { VaultController } from './vault/vault.controller';
import { VaultService } from './vault/vault.service';
import { BlockchainModule } from './blockchain/blockchain.module'; 

@Module({
  imports: [UploadModule, BlockchainModule],
  controllers: [AppController, VaultController],
  providers: [VaultService],
})
export class AppModule {}
