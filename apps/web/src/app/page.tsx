import { normalizeApiBaseUrl } from '@omsua/shared';
import { StorefrontClientShell } from '@/components/storefront/StorefrontClientShell';
import { fetchBranches, fetchCatalog } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const runtimeApiUrl = process.env['NEXT_PUBLIC_API_URL'];
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
