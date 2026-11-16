import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, HealthStatus } from '@omsua/shared';
import { HealthQueryDto } from './dto/health-query.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check backend service health' })
  @ApiOkResponse({ description: 'Backend service is healthy' })
  check(@Query() _query: HealthQueryDto): ApiResponse<HealthStatus> {
    return this.healthService.getHealth();
  }
}
