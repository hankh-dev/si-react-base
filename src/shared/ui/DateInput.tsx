import { DatePicker, type DatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import { DATE_FORMAT } from '@/shared/config/constants';
import { EMPTY_DATE_RANGE, type DateRange } from '@/shared/lib/dateRange';

/*
 * 날짜 입력
 *
 * Ant Design 의 DatePicker 는 값을 dayjs 객체로 다루지만, 폼 값과 API 는 'YYYY-MM-DD' 문자열을 씁니다.
 * 이 컴포넌트들이 그 변환을 맡으므로 화면에서는 문자열만 다루면 됩니다. 빈 값은 '' 입니다.
 */

type DateInputProps = Omit<DatePickerProps<Dayjs, false>, 'value' | 'onChange'> & {
  value?: string;
  onChange?: (value: string) => void;
};

/** 날짜 하나를 입력합니다. */
export function DateInput({ value, onChange, ...rest }: DateInputProps) {
  return (
    <DatePicker<Dayjs, false>
      style={{ width: '100%' }}
      {...rest}
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange?.(date ? date.format(DATE_FORMAT) : '')}
    />
  );
}

type DateRangeInputProps = Omit<RangePickerProps, 'value' | 'onChange'> & {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
};

/** 기간(시작일 ~ 종료일)을 입력합니다. 한쪽만 입력해도 됩니다. */
export function DateRangeInput({ value, onChange, ...rest }: DateRangeInputProps) {
  const [from, to] = value ?? EMPTY_DATE_RANGE;

  return (
    <DatePicker.RangePicker
      style={{ width: '100%' }}
      allowEmpty
      {...rest}
      value={[from ? dayjs(from) : null, to ? dayjs(to) : null]}
      onChange={(dates) =>
        onChange?.([dates?.[0]?.format(DATE_FORMAT) ?? '', dates?.[1]?.format(DATE_FORMAT) ?? ''])
      }
    />
  );
}
