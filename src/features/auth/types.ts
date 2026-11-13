export interface LoginRequest {
  loginId: string;
  password: string;
}

/** 로그인한 사용자 정보 */
export interface AuthUser {
  id: number;
  loginId: string;
  userName: string;
  deptName: string;
  roleCode: string;
  roleName: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
