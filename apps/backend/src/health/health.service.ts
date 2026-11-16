import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type ApiResponse,
  type HealthStatus,
  createApiResponse,
} from '@omsua/shared';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealth(): ApiResponse<HealthStatus> {
    return createApiResponse({
      status: 'ok',
      service: 'omsua-backend',
      version: '0.1.0',
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    });
  }
}
