/** 기간 조회조건: [시작일, 종료일]. 각 값은 'YYYY-MM-DD' 이고 비어 있으면 '' */
export type DateRange = [from: string, to: string];

export const EMPTY_DATE_RANGE: DateRange = ['', ''];
