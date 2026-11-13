import { http, HttpResponse } from 'msw';
import { menusForRole } from '../db/menus';
import { api, authenticate, networkDelay, unauthorized } from '../lib/respond';

export const menuHandlers = [
  http.get(api('/menus/my'), async ({ request }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    return HttpResponse.json(menusForRole(user.roleCode));
  }),
];
