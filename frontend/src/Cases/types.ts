import { CaseType, TimeZone, Case } from 'types'

export interface AssignedUser {
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  last_login: string
}

export interface AssignedUserData {
  users: AssignedUser[]
  available: AssignedUser[]
}

export interface ShowCaseResponse {
  caseTypes: CaseType[]
  timeZones: TimeZone[]
  caseInstance: Case
}

export interface AvailableUserCaseOption {
  title: string
  id: number
}
