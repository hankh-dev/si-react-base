import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/*
 * 레이어 규칙: app → pages → features → shared
 * 위 레이어는 아래 레이어를 import 할 수 있지만 반대 방향은 금지합니다.
 */
const layer = (name) => ({
  group: [`@/${name}`, `@/${name}/**`],
  message: `레이어 규칙 위반입니다. 이 폴더에서는 ${name} 레이어를 import 할 수 없습니다. (docs/01-architecture.md)`,
});

const noAxios = {
  group: ['axios'],
  message: 'HTTP 호출은 @/shared/api 의 http 를 사용합니다.',
};

const noGridVendor = {
  group: ['ag-grid-community', 'ag-grid-react', '@ag-grid-community/*'],
  message: '그리드는 @/shared/ui 의 DataGrid 를 사용합니다.',
};

const restrict = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

export default defineConfig([
  globalIgnores(['dist', 'coverage']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      // console.log 는 운영 산출물에 남기지 않습니다.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // onClick={async () => ...} 같은 비동기 이벤트 핸들러는 허용합니다.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // ----- 레이어별 import 제한 -----
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: restrict(layer('app'), layer('pages'), layer('features'), layer('mocks')),
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: restrict(layer('app'), layer('pages'), layer('mocks'), noAxios, noGridVendor),
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: restrict(layer('app'), layer('mocks'), noAxios, noGridVendor),
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: restrict(layer('mocks'), noAxios, noGridVendor),
  },

  // ----- Node 에서 실행되는 설정 파일 -----
  {
    files: ['vite.config.ts'],
    languageOptions: { globals: globals.node },
  },

  // Prettier 와 충돌하는 서식 규칙을 끕니다. 항상 마지막에 둡니다.
  prettier,
]);
