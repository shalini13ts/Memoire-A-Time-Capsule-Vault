import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);

  async upload(buffer: Buffer): Promise<string> {
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: 'upload.jpg', // You can replace this with the real filename if needed
    });

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET,
      },
    });

    return res.data.IpfsHash;
  }
}
