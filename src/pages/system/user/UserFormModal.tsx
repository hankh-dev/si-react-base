import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Result } from 'antd';
import { useForm } from 'react-hook-form';
import { CodeSelect } from '@/features/code/CodeSelect';
import { useSaveUser, useUser } from '@/features/user/queries';
import {
  EMPTY_USER_FORM,
  toUserFormValues,
  toUserSaveRequest,
  userFormSchema,
  type UserFormValues,
} from '@/features/user/schema';
import { messages } from '@/shared/config/messages';
import { applyFieldErrors } from '@/shared/lib/formErrors';
import { DateInput } from '@/shared/ui/DateInput';
import { EditForm } from '@/shared/ui/EditForm';
import { toast } from '@/shared/ui/feedback';
import { FormField } from '@/shared/ui/FormField';
import { Modal } from '@/shared/ui/Modal';
import { PageLoading } from '@/shared/ui/PageLoading';
import styles from './UserFormModal.module.css';

interface UserFormModalProps {
  open: boolean;
  /** 수정할 사용자 id. null 이면 등록입니다. */
  userId: number | null;
  /** true 이면 내용만 보여주고 저장할 수 없습니다 (수정 권한이 없는 사용자). */
  readOnly?: boolean;
  onClose: () => void;
}

/*
 * 사용자 등록/수정 팝업 — 입력 폼의 표준 예시
 *
 * 세 겹으로 나뉩니다.
 * - UserFormModal: 팝업 틀. 닫으면 안쪽 내용이 사라지므로 다시 열 때 항상 처음 상태입니다.
 * - UserFormLoader: 수정이면 서버에서 최신 값을 먼저 조회합니다.
 * - UserForm: 값이 준비된 뒤에 그려지는 실제 폼 (검증, 저장).
 */
export function UserFormModal({ open, userId, readOnly = false, onClose }: UserFormModalProps) {
  const title = userId === null ? '사용자 등록' : readOnly ? '사용자 상세' : '사용자 수정';

  return (
    <Modal open={open} title={title} width={640} footer={null} onCancel={onClose}>
      <UserFormLoader userId={userId} readOnly={readOnly} onClose={onClose} />
    </Modal>
  );
}

type UserFormLoaderProps = Pick<UserFormModalProps, 'userId' | 'onClose'> & { readOnly: boolean };

function UserFormLoader({ userId, readOnly, onClose }: UserFormLoaderProps) {
  const user = useUser(userId);

  if (userId === null) {
    return (
      <UserForm
        key="new"
        userId={null}
        initialValues={EMPTY_USER_FORM}
        readOnly={false}
        onClose={onClose}
      />
    );
  }
  if (user.isPending) return <PageLoading />;
  if (user.isError) {
    return <Result status="warning" title="사용자 정보를 불러오지 못했습니다." />;
  }
  return (
    <UserForm
      // 다른 사용자를 열면 폼을 새로 만들어 이전 입력값이 남지 않게 합니다.
      key={userId}
      userId={userId}
      initialValues={toUserFormValues(user.data)}
      readOnly={readOnly}
      onClose={onClose}
    />
  );
}

interface UserFormProps extends UserFormLoaderProps {
  initialValues: UserFormValues;
}

function UserForm({ userId, initialValues, readOnly, onClose }: UserFormProps) {
  const isNew = userId === null;
  const saveUser = useSaveUser();
  const { control, handleSubmit, setError } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialValues,
  });

  const onSubmit = handleSubmit((values) => {
    saveUser.mutate(
      { id: userId, body: toUserSaveRequest(values) },
      {
        onSuccess: () => {
          toast.success(messages.saved);
          onClose();
        },
        // 서버 검증 오류(아이디 중복 등)를 해당 입력란 아래에 표시합니다.
        // 오류 알림 자체는 공통 처리(app/queryClient.ts)가 띄웁니다.
        onError: (error) => {
          applyFieldErrors(error, setError);
        },
      },
    );
  });

  return (
    <EditForm onSubmit={onSubmit} disabled={readOnly || saveUser.isPending}>
      <div className={styles.fields}>
        <FormField control={control} name="loginId" label="아이디" required>
          {(field) => (
            // 아이디는 등록할 때만 입력할 수 있습니다.
            <Input {...field} disabled={!isNew} maxLength={20} autoFocus={isNew} />
          )}
        </FormField>
        <FormField control={control} name="userName" label="이름" required>
          {(field) => <Input {...field} maxLength={20} />}
        </FormField>
        <FormField control={control} name="email" label="이메일" required>
          {(field) => <Input {...field} maxLength={100} />}
        </FormField>
        <FormField control={control} name="phone" label="휴대전화">
          {(field) => <Input {...field} placeholder="010-0000-0000" maxLength={13} />}
        </FormField>
        <FormField control={control} name="deptCode" label="부서" required>
          {(field) => <CodeSelect {...field} groupCode="DEPT" placeholder="선택" />}
        </FormField>
        <FormField control={control} name="roleCode" label="권한" required>
          {(field) => <CodeSelect {...field} groupCode="ROLE" placeholder="선택" />}
        </FormField>
        <FormField control={control} name="status" label="상태" required>
          {(field) => <CodeSelect {...field} groupCode="USER_STATUS" placeholder="선택" />}
        </FormField>
        <FormField control={control} name="joinedDate" label="입사일" required>
          {(field) => <DateInput {...field} />}
        </FormField>
      </div>
      <FormField control={control} name="remark" label="비고">
        {(field) => <Input.TextArea {...field} rows={3} maxLength={200} showCount />}
      </FormField>

      <div className={styles.footer}>
        {/* 읽기 전용일 때도 닫기 버튼은 눌러야 하므로 disabled 를 직접 지정합니다. */}
        <Button disabled={saveUser.isPending} onClick={onClose}>
          닫기
        </Button>
        {!readOnly && (
          <Button type="primary" htmlType="submit" loading={saveUser.isPending}>
            저장
          </Button>
        )}
      </div>
    </EditForm>
  );
}
