import { z } from 'zod';
import { ko } from 'zod/locales';

/*
 * Zod 기본 오류 문구를 한국어로 바꿉니다. main.tsx 와 테스트 설정에서 한 번 import 합니다.
 * 화면에 보이는 폼 검증 문구는 각 스키마에서 직접 지정하는 것을 원칙으로 하고,
 * 이 설정은 문구를 지정하지 않은 경우의 기본값입니다.
 */
z.config(ko());
