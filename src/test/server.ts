import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

/**
 * 테스트용 목 서버. 개발 때 브라우저에서 쓰는 것과 같은 핸들러(src/mocks/handlers)로 응답합니다.
 * 특정 테스트에서만 다른 응답이 필요하면 server.use(...) 로 덮어씁니다. (테스트가 끝나면 자동으로 원복)
 */
export const server = setupServer(...handlers);
