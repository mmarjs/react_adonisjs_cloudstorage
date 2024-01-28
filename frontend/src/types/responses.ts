import {
  CaseType,
  TimeZone,
  BillingStatus,
  Company,
  Case,
  ServiceName,
  Folder,
  TotalFileSizeByCase,
  AssignedUserCount,
} from './redux'

import { AccountRole } from 'types'

interface AcquisitionException {
  type: string
  description: string
  created_at: string
  acquisition: number
}

interface AcquisitionTask {
  service_name: string
  description: string
  status: 'pending' | 'active' | 'failed' | 'finished' | 'canceled'
  finished_at: string | null
}

export interface AcquisitionStatusResponse {
  acquisitionId: number
  exceptions: AcquisitionException[]
  tasks: AcquisitionTask[]
}

export interface AddCaseResponse {
  case_types: CaseType[]
  time_zones: TimeZone[]
}

export interface CaseReqs {
  caseTypes: CaseType[]
  timeZones: TimeZone[]
}

export interface ManageCasesResponse {
  cases: Case[]
  caseTotalFileSizes: TotalFileSizeByCase[]
  assignedUserCount: AssignedUserCount[]
  custodianCount: number
}

export interface TreeDataResponse {
  folders: Folder[]
  files: number
}

export interface LoginResponse {
  user: LoginUserData
  company: Company
  billing_status: BillingStatus
  token: string
}

export interface TwoFactorRequiredResponse {
  extra: string
  method: 'email'
}

export interface LoginUserData {
  id: number
  first_name: string
  last_name: string
  email: string
  status: 'invited' | 'active' | 'suspended' | 'deleted'
  role: AccountRole
}

export interface Service {
  id: number
  name: ServiceName
  filterable: boolean
  type: 'api' | 'upload'
}

export interface ServiceItem {
  id: number
  service_id: number
  name: string
}

export interface SelectedService extends Service {}

export interface SelectedServiceItem extends ServiceItem {
  selected: boolean
}

export interface UploadService {
  id: number
  name: string
}

export interface UploadSelectedService {
  id: number
  name: string
}

export interface CustodianData {
  id: number
  name: string
  phone: string
  email: string
  notes?: string
  companyName: string
  acquisitions: AcquisitionData[]
}

export interface AcquisitionData {
  created_at: string
  source: string
  account: string
  cloudAccountUsername: string
  serviceSelection: string
  filtered: boolean
  records: number
}

export interface CloudAcquisitionScreen {
  services: Service[]
  serviceItems: ServiceItem[]
  case: Case
  custodians: CustodianData[]
}

export interface WasabiUploadUrl {
  url: string
  fields: {
    'key': string
    'bucket': string
    'X-Amz-Algorithm': string
    'X-Amz-Credential': string
    'X-Amz-Date': string
    'Policy': string
    'X-Amz-Signature': string
  }
}

export type WorkGroupFolderStatus = 'pending' | 'active' | 'updating' | 'trashed'

export type WorkGroupFileStatus = 'pending' | 'active' | 'updating' | 'trashed'

export type PersonalFolderStatus = 'pending' | 'active' | 'updating' | 'trashed'

export type PersonalFileStatus = 'pending' | 'active' | 'updating' | 'trashed'

export interface WorkGroupFile {
  id: number
  workGroupFolderId: number
  fileTypeId: number
  ownerId: number
  name: string
  path: string
  size: number
  access: 'private' | 'shared'
  status: WorkGroupFileStatus
  ownerName: string
  notes: string
  dateCreated: string
  lastModified: string
  lastAccessed: string
  lastAccessedById: number
  createdAt: string
  updatedAt: string
}

export interface ErrorResponse {
  error: string
}

export interface ActionResponse {
  action: string
}

export interface StatusResponse {
  status: string
}

export interface WorkSpaceFolderItem {
  id: number
  parent_id: number
  name: string
  status: WorkGroupFolderStatus
  owner_name: string
  notes: string
  access: 'private' | 'shared'
  updated_at: string
  path: string
  hasFolders?: boolean
}

export interface WorkGroupFileItem {
  id: number
  work_group_folder_id: number
  file_type_id: number
  owner_id: number
  name: string
  path: string
  size: number
  access: 'private' | 'shared'
  status: WorkGroupFileStatus
  owner_name: string
  notes: string
  date_created: string
  last_modified: string
  last_accessed: string
  last_accessed_by_id: number
  created_at: string
  updated_at: string
  fileType: {
    id: number
    name: string
  }
  folder: {
    id: number
    name: string
  }
}

export interface WorkspaceUser {
  first_name: string
  fullName: string
  id: number
  last_name: string
}

export interface WorkspaceDirectory {
  users: WorkspaceUser[]
  workGroupData: WorkSpaceFolderItem[]
  personalData: WorkSpaceFolderItem[]
}
