import User from 'App/Models/User'

export type TwoFactorMethods = 'email' | null

export type AccountRole =
  | 'account-owner'
  | 'account-admin'
  | 'case-manager'
  | 'client-user'
  | 'evidence-user'

export type UserStatus = 'invited' | 'active' | 'suspended' | 'deleted'

export interface UserDetails {
  user: User
  billing_status: string
  token: string
}

export interface UpdateUserProfile {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zip?: number
  companyName?: string
  role?: 'account-admin' | 'case-manager' | 'client-user'
  isTwoFactorRequired?: boolean
  twoFactorMethod?: TwoFactorMethods
}

export interface UpdateAccountUser {
  status: 'invited' | 'deleted' | 'active' | 'suspended'
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zip?: number
  company_name?: string
  role?: 'account-admin' | 'case-manager' | 'evidence-user'
  permitted_cases?: number[]
}

export interface UserInvitationBody {
  company_id: number
  first_name: string
  last_name: string
  company_name?: string
  street?: string
  state?: string
  zip?: number
  phone?: string
  email: string
  role: 'account-admin' | 'case-manager' | 'client-user'
  permitted_cases?: number[]
}

export interface AcceptInvitationBody {
  code: string
  password: string
}

export interface CustodianData {
  custodianId: number
  custodianName: string
  serviceId: number
  serviceName: string
  caseId: number
  caseName: string
  clientName: string
  clientReference: string
}

export interface ShowUserInfo {
  id: number
  email: string
  role: AccountRole
  first_name: string
  last_name: string
  status: UserStatus
  company_name: string
  last_login: string | null
  created_at: string | null
}

export interface ShowUserUser {
  id: number
  email: string
  first_name: string
  last_name: string
  company_name: string
  street: string
  city: string
  state: string
  zip: number
  phone: string
  status: 'active' | 'invited'
}

export interface ShowUserCase {
  id: number
  case_name: string
  client_name: string
  client_reference: string
}

export interface ShowUserState {
  id: number
  name: string
}

export interface ShowUserResponse {
  user: ShowUserUser
  role: AccountRole
  cases: ShowUserCase[]
  states: ShowUserState[]
}
