import { AccountRole } from 'types'

export interface ShowUserInfo {
  id: number
  email: string
  role: AccountRole
  first_name: string
  last_name: string
  status: 'invited' | 'active'
  company_name: string
  last_login: string | null
  created_at: string | null
}

export interface EmployeeInfo {
  current: number
  max: number
}

export interface ShowUsersResponse {
  users: ShowUserInfo[]
  employeeInfo: EmployeeInfo
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

export interface UpdateCompanyParams {
  name?: string
  isTwoFactorRequired?: boolean
  status?: string
}
