import { Button, Card, Statistic, Table } from 'antd';
import { useCodes } from '@/features/code/queries';
import { useDashboardSummary } from '@/features/dashboard/queries';
import type { RecentUser } from '@/features/dashboard/types';
import { useOpenScreen } from '@/shared/screen/useOpenScreen';
import { PageContainer } from '@/shared/ui/PageContainer';
import styles from './DashboardPage.module.css';

/** 홈 화면. 요약 숫자와 최근 입사자를 보여주는 간단한 예시입니다. */
export default function DashboardPage() {
  const summary = useDashboardSummary();
  const dept = useCodes('DEPT');
  const openScreen = useOpenScreen();

  const stats = [
    { title: '전체 사용자', value: summary.data?.totalUsers },
    { title: '정상', value: summary.data?.activeUsers },
    { title: '잠김', value: summary.data?.lockedUsers },
    { title: '올해 입사', value: summary.data?.joinedThisYear },
  ];

  return (
    <PageContainer>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <Card key={stat.title} size="small">
            <Statistic
              title={stat.title}
              value={stat.value}
              suffix="명"
              loading={summary.isPending}
            />
          </Card>
        ))}
      </div>

      <Card
        size="small"
        title="최근 입사자"
        extra={
          <Button type="link" size="small" onClick={() => openScreen('/system/users')}>
            사용자 관리 열기
          </Button>
        }
      >
        <Table<RecentUser>
          size="small"
          rowKey="id"
          pagination={false}
          loading={summary.isPending}
          dataSource={summary.data?.recentUsers}
          columns={[
            { title: '아이디', dataIndex: 'loginId' },
            { title: '이름', dataIndex: 'userName' },
            { title: '부서', dataIndex: 'deptCode', render: (code: string) => dept.labelOf(code) },
            { title: '입사일', dataIndex: 'joinedDate' },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
