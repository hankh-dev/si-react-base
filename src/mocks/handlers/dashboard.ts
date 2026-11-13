import { http, HttpResponse } from 'msw';
import type { DashboardSummary } from '@/features/dashboard/types';
import { userDb } from '../db/users';
import { api, authenticate, networkDelay, unauthorized } from '../lib/respond';

export const dashboardHandlers = [
  http.get(api('/dashboard/summary'), async ({ request }) => {
    await networkDelay();
    if (!authenticate(request)) return unauthorized();

    const users = userDb.all();
    const thisYear = String(new Date().getFullYear());
    const body: DashboardSummary = {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === 'ACTIVE').length,
      lockedUsers: users.filter((user) => user.status === 'LOCKED').length,
      joinedThisYear: users.filter((user) => user.joinedDate.startsWith(thisYear)).length,
      recentUsers: userDb
        .search({}, 'joinedDate,desc')
        .slice(0, 5)
        .map(({ id, loginId, userName, deptCode, joinedDate }) => ({
          id,
          loginId,
          userName,
          deptCode,
          joinedDate,
        })),
    };
    return HttpResponse.json(body);
  }),
];
