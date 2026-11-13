import type { User, UserSaveRequest } from '@/features/user/types';

/*
 * 목 사용자 데이터
 *
 * 화면을 새로 열 때마다 같은 데이터로 시작하도록, 고정된 시드로 만듭니다.
 * 등록·수정·삭제는 메모리에만 반영되고 새로고침하면 처음 상태로 돌아갑니다.
 */

/** 로그인할 수 있는 목 계정. 실제 비밀번호 검증은 서버의 일입니다. */
export const MOCK_PASSWORDS: Record<string, string> = {
  admin: 'admin1234',
  user: 'user1234',
};

const SURNAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
  '한',
  '오',
  '서',
  '신',
];
const GIVEN_NAMES = [
  '민준',
  '서연',
  '지호',
  '하은',
  '도윤',
  '수아',
  '예준',
  '지우',
  '시우',
  '서윤',
  '주원',
  '하윤',
  '지후',
  '민서',
  '준서',
  '채원',
  '현우',
  '지민',
  '건우',
  '윤서',
];
const DEPTS = ['D001', 'D002', 'D003', 'D004', 'D005', 'D006', 'D007', 'D008'];

/** 시드가 같으면 항상 같은 순서의 난수를 만드는 생성기 (mulberry32) */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

function seedUsers(): User[] {
  const random = createRandom(20261112);
  const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)];
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

  const fixed: User[] = [
    {
      id: 1,
      loginId: 'admin',
      userName: '관리자',
      email: 'admin@example.com',
      phone: '01012340001',
      deptCode: 'D001',
      roleCode: 'ADMIN',
      status: 'ACTIVE',
      joinedDate: '2018-03-02',
      lastLoginAt: '2026-11-11T08:52:10',
      remark: '시스템 관리자 계정',
    },
    {
      id: 2,
      loginId: 'user',
      userName: '홍길동',
      email: 'user@example.com',
      phone: '01012340002',
      deptCode: 'D004',
      roleCode: 'USER',
      status: 'ACTIVE',
      joinedDate: '2021-07-12',
      lastLoginAt: '2026-11-10T17:20:45',
      remark: '',
    },
  ];

  const generated = Array.from({ length: 135 }, (_, index): User => {
    const id = index + 3;
    const statusRoll = random();
    const status = statusRoll < 0.82 ? 'ACTIVE' : statusRoll < 0.92 ? 'LOCKED' : 'INACTIVE';
    const roleRoll = random();
    const roleCode = roleRoll < 0.04 ? 'ADMIN' : roleRoll < 0.2 ? 'MANAGER' : 'USER';
    const loginId = `user${pad(id, 4)}`;
    const neverLoggedIn = status === 'INACTIVE' && random() < 0.5;

    return {
      id,
      loginId,
      userName: `${pick(SURNAMES)}${pick(GIVEN_NAMES)}`,
      email: `${loginId}@example.com`,
      phone: `010${pad(between(1000, 9999), 4)}${pad(between(0, 9999), 4)}`,
      deptCode: pick(DEPTS),
      roleCode,
      status,
      joinedDate: `${between(2018, 2026)}-${pad(between(1, 10))}-${pad(between(1, 28))}`,
      lastLoginAt: neverLoggedIn
        ? null
        : `2026-${pad(between(9, 10))}-${pad(between(1, 28))}T${pad(between(8, 18))}:${pad(between(0, 59))}:${pad(between(0, 59))}`,
      remark: '',
    };
  });

  return [...fixed, ...generated];
}

let users = seedUsers();
let nextId = users.length + 1;

export interface UserFilter {
  keyword?: string;
  deptCode?: string;
  status?: string;
  joinedFrom?: string;
  joinedTo?: string;
}

const SORTABLE_FIELDS = ['id', 'loginId', 'userName', 'joinedDate', 'lastLoginAt'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(field: string): field is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(field);
}

function compare(a: string | number | null, b: string | number | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'ko');
}

export const userDb = {
  /** 조건에 맞는 전체 건을 정렬해서 돌려줍니다. sort 는 "필드,asc|desc". 기본은 최근 등록순. */
  search(filter: UserFilter, sort?: string | null): User[] {
    const keyword = filter.keyword?.trim().toLowerCase();
    const found = users.filter(
      (user) =>
        (!keyword ||
          user.loginId.toLowerCase().includes(keyword) ||
          user.userName.toLowerCase().includes(keyword)) &&
        (!filter.deptCode || user.deptCode === filter.deptCode) &&
        (!filter.status || user.status === filter.status) &&
        (!filter.joinedFrom || user.joinedDate >= filter.joinedFrom) &&
        (!filter.joinedTo || user.joinedDate <= filter.joinedTo),
    );

    const [field = 'id', order = 'desc'] = (sort ?? '').split(',');
    const sortField: SortableField = isSortableField(field) ? field : 'id';
    const direction = order === 'asc' ? 1 : -1;
    return found.sort((a, b) => direction * compare(a[sortField], b[sortField]) || b.id - a.id);
  },

  all(): User[] {
    return users;
  },

  find(id: number): User | undefined {
    return users.find((user) => user.id === id);
  },

  findByLoginId(loginId: string): User | undefined {
    return users.find((user) => user.loginId === loginId);
  },

  create(body: UserSaveRequest): User {
    const user: User = { ...body, id: nextId++, lastLoginAt: null };
    users = [...users, user];
    return user;
  },

  update(id: number, body: UserSaveRequest): User | undefined {
    const current = this.find(id);
    if (!current) return undefined;
    // 아이디는 등록 후 바꿀 수 없습니다.
    const updated: User = { ...current, ...body, loginId: current.loginId };
    users = users.map((user) => (user.id === id ? updated : user));
    return updated;
  },

  remove(ids: number[]): number {
    const before = users.length;
    users = users.filter((user) => !ids.includes(user.id));
    return before - users.length;
  },

  touchLastLogin(id: number, at: string): void {
    users = users.map((user) => (user.id === id ? { ...user, lastLoginAt: at } : user));
  },
};
