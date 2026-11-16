import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class HealthQueryDto {
  @ApiPropertyOptional({ description: 'Optional diagnostic echo tag' })
  @IsOptional()
  @IsString()
  echo?: string;
}
