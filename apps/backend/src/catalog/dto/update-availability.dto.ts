import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Whether the product is currently available for ordering',
    example: false,
  })
  @IsBoolean()
  isAvailable: boolean;
}
