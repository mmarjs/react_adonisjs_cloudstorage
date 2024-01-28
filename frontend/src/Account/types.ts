export interface CaseCustodiansProps {
  permission: InviteUserPermission
}

export interface InviteUserCaseFormProps {
  onSelecCase: () => void
}

export interface InviteUserEvidenceFormProps {
  onSelecCase: () => void
}

export type AccountRole = 'account-owner' | 'account-admin' | 'case-manager' | 'client-user'
export type AccountUserStatus = 'invited' | 'active' | 'suspended'
export type UserStatus = 'invited' | 'active' | 'suspended'

export interface InviteUserPermission {
  case: InviteUserCase
  custodians: InviteUserCustodian[]
}

export interface InviteUserCase {
  id: number
  case_name: string
  client_name: string
  client_reference: string
  checked: boolean
  all_custodians_checked: boolean
  expanded: boolean
}

export interface InviteUserCustodian {
  custodian_id: number
  case_id: number
  custodian_name: string
  collection_name: string
  checked: boolean
}

export interface InviteUserCaseCustodiansRowsProps {
  custodian: InviteUserCustodian
  onCustodian: (
    ev: React.ChangeEvent<HTMLInputElement>,
    caseId: number,
    custodianId: number
  ) => void
}

export interface UserCreateData {
  cases: UserCreateCase[]
  states: UserCreateState[]
}

export interface UserCreateCase {
  id: number
  case_name: string
  client_name: string
  client_reference: string
}

export interface UserCreateCustodian {
  custodian_id: number
  custodian_name: string
  collection_account_item_id: number
  collection_name: string
  case_id: number
  case_name: number
  client_name: string
  client_reference?: string
}

export interface UserCreateState {
  id: number
  name: string
}

export interface UserCurrentData {
  cases: UserCreateCase[]
  custodians: UserCreateCustodian[]
  states: UserCreateState[]
  permittedCaseIds: number[]
  permittedCustodianIds: number[]
  user: FetchedUser
  role: AccountRole
}

export interface FetchedUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: AccountRole
  status: AccountUserStatus
  street?: string
  city?: string
  state?: string
  zip?: number
  company_name?: string
  created_at?: string
  updated_at?: string
}

export interface InviteUserForm {
  first_name: string
  last_name: string
  email: string
  role: AccountRole
  company_name?: string
  street?: string
  city?: string
  state?: string
  zip?: number
  phone?: string
}

export interface InviteUserParams extends InviteUserForm {
  company_id: number
  permitted_cases: number[]
}

export interface UpdateUserForm extends InviteUserForm {
  status: UserStatus
  role: AccountRole
}

export interface UpdateUserParams extends UpdateUserForm {
  permitted_cases: number[]
}
