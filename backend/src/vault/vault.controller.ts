import {
  Controller,
  Get,
  Param,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { VaultService } from './vault.service';
import { Response } from 'express';

@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get(':vaultId/status')
  async getStatus(@Param('vaultId') vaultId: string) {
    return this.vaultService.getVaultStatus(vaultId);
  }

  @Get(':vaultId/tx')
  async getRetrieveTxRequest(@Param('vaultId') vaultId: string) {
    return this.vaultService.getRetrieveTxRequest(vaultId);
  }

  @Get('tx/:txHash/files')
  async streamFilesByTx(@Param('txHash') txHash: string, @Res() res: Response) {
    return this.vaultService.streamFilesFromTx(txHash, res);
  }

  @Get('tx/:txHash/cids')
  async getCids(@Param('txHash') txHash: string) {
    return this.vaultService.getCidsFromTx(txHash);
  }
}
