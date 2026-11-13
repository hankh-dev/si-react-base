import { Form } from 'antd';
import { useId, type ReactElement, type ReactNode } from 'react';
import {
  useController,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  /** useForm() 이 돌려준 control */
  control: Control<TValues>;
  /** 폼 값의 속성 이름 */
  name: TName;
  label?: ReactNode;
  /** 필수 표시(*). 실제 검증은 폼의 Zod 스키마가 합니다. */
  required?: boolean;
  /** 입력 컴포넌트를 그리는 함수. 받은 field 를 입력 컴포넌트에 그대로 펼쳐 넣습니다. */
  children: (
    field: ControllerRenderProps<TValues, TName> & { id: string },
    state: ControllerFieldState,
  ) => ReactElement;
}

/**
 * 폼의 입력 한 칸: 라벨 + 입력 컴포넌트 + 검증 오류 문구.
 * react-hook-form 의 값·검증 상태를 Ant Design 의 Form.Item 모양으로 연결합니다.
 *
 * @example
 * <FormField control={control} name="userName" label="이름" required>
 *   {(field) => <Input {...field} maxLength={20} />}
 * </FormField>
 */
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  label,
  required,
  children,
}: FormFieldProps<TValues, TName>) {
  const id = useId();
  const { field, fieldState } = useController({ control, name });

  return (
    <Form.Item
      label={label}
      htmlFor={id}
      required={required}
      validateStatus={fieldState.error ? 'error' : undefined}
      help={fieldState.error?.message}
    >
      {children({ ...field, id }, fieldState)}
    </Form.Item>
  );
}
