import { http } from '@/shared/api/http';
import type { DashboardSummary } from './types';

export async function fetchDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>('/dashboard/summary', { signal });
  return data;
}
