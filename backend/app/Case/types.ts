import CaseType from 'App/Models/CaseType'
import TimeZone from 'App/Models/TimeZone'
import Case from 'App/Models/Case'

export interface CaseReqs {
  caseTypes: CaseType[]
  timeZones: TimeZone[]
}

export interface ShowCaseResponse extends CaseReqs {
  caseInstance: Case
}

export interface CreateCaseParams {
  companyId: number
  caseTypeId: number
  timeZoneId: number
  caseName: string
  clientName: string
  createdById: number
  status: 'active' | 'archived'
  caseNumber?: string
  clientReference?: string
  clientPhone?: string
  clientEmail?: string
  notes?: string
}

export interface UpdateCaseParams {
  caseTypeId: number
  timeZoneId: number
  caseName: string
  clientName: string
  status: 'active' | 'archive' | 'delete'
  caseNumber?: string
  clientReference?: string
  clientPhone?: string
  clientEmail?: string
  notes?: string
}

export interface CaseSearchParams {
  type: 'simple' | 'advanced'
  search: string
  companyId: number
  showArchived: boolean
}

export interface AddPermissionParams {
  userId: number
  companyId: number
  resourceId: number
}

export interface AssignedUser {
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  last_login: string | null
}

export interface AssignedUserCount {
  caseId: number
  userNumber: number
}

export type CaseStatus = 'active' | 'archived' | 'deleted'
