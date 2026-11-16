import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns typed ApiResponse<HealthStatus> payload', () => {
    const response = controller.check({});
    expect(response.success).toBe(true);
    expect(response.data.status).toBe('ok');
    expect(response.data.service).toBe('omsua-backend');
    expect(response.data.version).toBe('0.1.0');
    expect(typeof response.data.uptime).toBe('number');
    expect(typeof response.timestamp).toBe('string');
  });
});
