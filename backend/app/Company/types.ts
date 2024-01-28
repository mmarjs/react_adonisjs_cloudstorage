import Company from 'App/Models/Company'
import User from 'App/Models/User'

export interface UpdateCompanyBody {
  name?: string
  role?: 'account-admin' | 'case-manager' | 'evidence-user'
  status?: 'active' | 'suspend' | 'delete'
  isTwoFactorRequired?: boolean
}

export interface StoreCustodianBody {
  caseId: number
  email: string
  name: string
  alias: string
  phone: string
  notes?: string
}

export interface CompanyUser {
  user: User
  company: Company
}

export interface CompanyUserIds {
  userId: number
  companyId: number
}

export interface EmployeeInfo {
  current: number
  max: number
}

export type BillingStatus = 'unactivated' | 'active' | 'suspended' | 'deleted'
