export interface RecentUser {
  id: number;
  loginId: string;
  userName: string;
  deptCode: string;
  joinedDate: string;
}

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  /** 올해 입사한 사용자 수 */
  joinedThisYear: number;
  /** 입사일이 최근인 사용자 5명 */
  recentUsers: RecentUser[];
}
