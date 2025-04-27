import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class UploadRequestDto {
  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'ISO timestamp for unlock date' })
  @IsString()
  @IsNotEmpty()
  lockTime: string; // ISO format or UNIX timestamp

  @ApiProperty({ example: 'my-vault-name', description: 'Unique vault name (lowercase, alphanumeric, dashes only)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9\-]+$/, {
    message: 'Vault name must be lowercase, alphanumeric, and may include dashes only.',
  })
  @MaxLength(32)
  name: string;
}
