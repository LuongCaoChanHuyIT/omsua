import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { ApiResponse, HealthStatus } from '@omsua/shared';
import {
  HealthResponseDto,
  HttpErrorResponseDto,
} from '../common/swagger-models.dto';
import { HealthQueryDto } from './dto/health-query.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check backend service health' })
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'Backend service is healthy',
  })
  @ApiBadRequestResponse({
    type: HttpErrorResponseDto,
    description: 'Invalid query parameter',
  })
  check(@Query() _query: HealthQueryDto): ApiResponse<HealthStatus> {
    return this.healthService.getHealth();
  }
}
