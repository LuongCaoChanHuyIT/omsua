import { normalizeApiBaseUrl } from '@omsua/shared';
import { StorefrontClientShell } from '@/components/storefront/StorefrontClientShell';
import { fetchBranches, fetchCatalog } from '@/lib/api';

export default async function HomePage() {
  const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
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
