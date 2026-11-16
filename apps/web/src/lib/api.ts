import { type HealthFetchResult, requestBackendHealth } from '@omsua/shared';

export async function fetchBackendHealth(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<HealthFetchResult> {
  return requestBackendHealth(baseUrl, fetchImpl);
}
