import { Company, AccountRole, LoginUserData, Notification, NotificationSetting } from 'types'

export type LoginAction =
  | 'validate-login'
  | 'need-two-factor'
  | 'verify-two-factor'
  | 'fetch-login-data'

export interface ValidateLoginParams {
  action: 'validate-login'
  email: string
  password: string
}

export interface ValidateLoginResponse {
  action: 'need-two-factor'
  loginProcessToken: string
  userId: number
  companies: RoleCompany[]
  error: 'no-such-account' | 'inactive-user' | 'unverified-user' | 'no-roles' | 'failed-to-login'
}

export interface LoginProcessParams {
  userId: number
  companyId: number
  loginProcessToken: string
}

export interface NeedTwoFactorParams extends LoginProcessParams {
  action: 'need-two-factor'
}

export interface NeedTwoFactorResponse {
  status: boolean
  error: 'invalid-login-process-token' | 'failed-to-login'
}

export interface VerifyTwoFactorParams extends LoginProcessParams {
  action: 'verify-two-factor'
  twoFactorToken: string
}

export interface VerifyTwoFactorResponse {
  status: 'two-factor-verified'
  error: 'invalid-two-factor' | 'invalid-login-process-token' | 'failed-to-login'
}

export interface FetchLoginDataParams extends LoginProcessParams {
  action: 'fetch-login-data'
}

export interface FetchLoginDataResponse {
  user: LoginUserData
  role: AccountRole
  company: Company
  token: string
  hasMultipleCompanies: boolean
  notifications: Notification[]
  notificationSettings: NotificationSetting[]
  permissions: Permission[]
  error: 'invalid-login-process-token' | 'failed-to-login'
}

export interface RoleCompany {
  id: number
  name: string
  userId: number
}

export interface PolicyActor {
  userId: number
  companyId: number
}

export type PolicyResource = 'case' | 'user' | 'custodian' | 'evidence' | 'role'

export type PolicyAction = 'read' | 'write' | 'create' | 'trash' | 'grant'

export interface Permission {
  action: PolicyAction
  resource: PolicyResource
  resourceId: number
}
