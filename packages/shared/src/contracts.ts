export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface HealthStatus {
  status: 'ok';
  service: string;
  version: string;
  uptime: number;
  environment: string;
}

export type HealthFetchResult =
  | { ok: true; payload: ApiResponse<HealthStatus> }
  | { ok: false; error: string };
