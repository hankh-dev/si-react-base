import { Select, type SelectProps } from 'antd';
import { useCodes } from './queries';

type CodeSelectProps = Omit<SelectProps<string>, 'options' | 'loading' | 'value' | 'onChange'> & {
  /** 공통코드 그룹. 예: 'USER_STATUS' */
  groupCode: string;
  /** 선택한 코드. 선택하지 않았으면 '' */
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * 공통코드 선택 상자. 그룹 코드만 넘기면 목록을 알아서 불러옵니다.
 *
 * @example
 * <CodeSelect groupCode="DEPT" allowClear placeholder="전체" {...field} />
 */
export function CodeSelect({ groupCode, value, onChange, ...rest }: CodeSelectProps) {
  const { options, isLoading } = useCodes(groupCode);

  return (
    <Select<string>
      style={{ width: '100%' }}
      {...rest}
      options={options}
      loading={isLoading}
      // 빈 값('')이면 placeholder 가 보이도록 undefined 로 바꿉니다.
      value={value || undefined}
      // 지우기(allowClear)를 누르면 undefined 가 오므로 '' 로 맞춥니다.
      onChange={(next: string | undefined) => onChange?.(next ?? '')}
    />
  );
}
