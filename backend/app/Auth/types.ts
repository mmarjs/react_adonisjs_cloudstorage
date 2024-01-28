import User from 'App/Models/User'
import Company from 'App/Models/Company'
import Permission from 'App/Models/Permission'
import Notification from 'App/Models/Notification'
import NotificationSetting from 'App/Models/NotificationSetting'
import { AccountRole } from 'App/types'

export interface AuthToken {
  userId: number
  companyId: number
  shareLinkId?: number
}

export interface RegisterAccountOwnerInput {
  first_name: string
  last_name: string
  email: string
  password: string
  account_name: string
}

export interface LoginInput {
  action: LoginAction
  email: string
  password: string
  userId: number
  companyId: number
  loginProcessToken: string
  twoFactorToken: string
}

export interface ResetPasswordBody {
  token: string
  password: string
  password_confirmation: String
}

export interface LoginDataResponse {
  user: User
  role: AccountRole
  company: Company
  token: string
  hasMultipleCompanies: boolean
  notifications: Notification[]
  notificationSettings: NotificationSetting[]
  permissions: Permission[]
}

export type LoginAction =
  | 'validate-login'
  | 'need-two-factor'
  | 'verify-two-factor'
  | 'fetch-login-data'

export interface ValidateLoginResponse {
  success: boolean
  message?: {
    error?: string
    action?: string
    status?: string
  }
}

export interface TwoFactorTokenJobParams {
  twoFactorTokenId: number
}

export interface PasswordResetJobParams {
  passwordResetId: number
}

export interface AccountVerificationJobParams {
  userId: number
}
