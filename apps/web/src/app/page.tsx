import { normalizeApiBaseUrl } from '@omsua/shared';
import { StorefrontClientShell } from '@/components/storefront/StorefrontClientShell';
import { fetchBranches, fetchCatalog } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const runtimeEnvKey = ['NEXT_PUBLIC', 'API_URL'].join('_');
  const runtimeApiUrl = process.env['API_URL'] ?? process.env[runtimeEnvKey];
  const apiBaseUrl = normalizeApiBaseUrl(runtimeApiUrl);
  const [{ catalog }, { branches }] = await Promise.all([
    fetchCatalog(apiBaseUrl),
    fetchBranches(apiBaseUrl),
  ]);

  return (
    <StorefrontClientShell
      initialCatalog={catalog}
      initialBranches={branches}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
