import { normalizeVietnameseText } from '@omsua/shared';

export function normalizeVietnameseSearch(value: string): string {
  return normalizeVietnameseText(value);
}
