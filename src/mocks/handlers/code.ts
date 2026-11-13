import { http, HttpResponse } from 'msw';
import { codeDb } from '../db/codes';
import { api, authenticate, networkDelay, notFound, unauthorized } from '../lib/respond';

export const codeHandlers = [
  http.get(api('/code-groups'), async ({ request }) => {
    await networkDelay();
    if (!authenticate(request)) return unauthorized();

    const keyword = new URL(request.url).searchParams.get('keyword') ?? '';
    return HttpResponse.json(codeDb.groups(keyword));
  }),

  http.get<{ groupCode: string }>(api('/codes/:groupCode'), async ({ request, params }) => {
    await networkDelay();
    if (!authenticate(request)) return unauthorized();

    const items = codeDb.items(params.groupCode);
    return items ? HttpResponse.json(items) : notFound();
  }),
];
