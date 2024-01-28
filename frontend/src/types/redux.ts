import { CustodianDetailsForm } from './forms'
import { WorkspaceDirectory } from './responses'
import { AccountRole, UserStatus } from 'types'
export type GroupType = 'workspace' | 'personal'

export interface Activity {
  id: number
  user_id: number
  company_id: number
  company_extra?: string
  event: string
  created_at: Date
  company: {
    id: number
    name: string
  }
  user: {
    id: number
    first_name: string
    last_name: string
  }
}

export type BillingStatus = 'unactivated' | 'active' | 'suspended' | 'deleted'

export type CaseStatus = 'active' | 'archived' | 'deleted'

export interface Case {
  id: number
  company_id: number
  case_type_id: number
  time_zone_id: number
  created_by_id: number
  public_case_id: string
  case_number?: string
  case_name: string
  client_name: string
  client_reference?: string
  client_phone?: string
  client_email?: string
  notes?: string
  status: CaseStatus
  created_at: string
  updated_at: string
  createdBy?: {
    id: number
    first_name: string
    last_name: string
  }
}

export interface Folder {
  id: number
  case_id: number
  parent_id: number
  owner_id: number
  name: string
  access: 'active' | 'archived'
  status: 'pending' | 'active' | 'updating' | 'trashed'
  owner_name: string
  notes: string
  created_at: string
  updated_at: string
  createdBy?: {
    id: number
    first_name: string
    last_name: string
  }
}

export interface CaseSearch {
  search?: string
  withArchived: boolean
  byOldest: boolean
}

export interface CaseType {
  id: number
  name: string
}

export interface CloudAcquisition {
  collectionData: CollectionAccount[]
  selectedCollection: string | null
  custodianDetails: CustodianDetailsForm
  selectedItems: SelectedCollectionAccountItem[]
  after: string | null
  before: string | null
}

export type CloudAcquistionStage = 1 | 2 | 3

export interface CollectionAccount {
  id: number
  name: string
  active: number
  created_at: string
  updated_at: string
  items: CollectionAccountItem[]
}

export interface CollectionAccountItem {
  id: number
  collection_account_id: number
  name: string
  description: string
  active: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: number
  user_id: number
  name?: string
  is_enterprise: number
  is_enterprise_subscriber: number
  is_two_factor_required: boolean
  has_multiple: boolean
  billing_status: BillingStatus
  channel: string
}

export interface SharePermission {
  id: number
  resource_id: number
  resource: 'work_group' | 'personal'
}

export interface SelectedCollectionAccount {
  account: string
  selected: boolean
}

export interface SelectedCollectionAccountItem {
  name: string
  collectionAccountId: number
  collectionAccountItemId: number
}

export interface Sidebar {
  open: boolean
  fixed: boolean
}

export interface CollapseMenu {
  open: boolean
  fixed: boolean
}

export interface TimeZone {
  id: number
  local: string
}

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: AccountRole | 'guest'
  status: UserStatus
  street?: string
  city?: string
  state?: string
  zip?: number
  company_name?: string
  is_two_factor_required: boolean
  two_factor_method?: 'email' | null
  channel: string
  created_at?: string
  updated_at?: string
}

export interface UserSettings {
  showUserForm: boolean
  showPasswordForm: Boolean
}

export interface TableDataList {
  fieldList: string[]
  fieldListByService: any[]
  fieldServiceId: string
  tableDataByService: any[]
  filterFlag: boolean
  selectRowDetail: any[]
  fieldNodeId: number
  selectedFolderFileIds: number[]
  selectedFolders: any
  tableViewMode: boolean
}

export interface ErrorType {
  flag: boolean
  message: string
}

export interface WorkspaceCollapseOption {
  workgroup: boolean
  personal: boolean
  share: boolean
  recycle: boolean
}

export interface WorkspaceData {
  collapseOption: WorkspaceCollapseOption
  subBreadcrumb: FolderTreeItem[]
  shareMode: string
  groupId: string
  caseId: number
  workGroupData: FolderTreeItem[]
  personalData: FolderTreeItem[]
  expendTreeData: WorkspaceDirectory
  workgroupParentId: number
  personalParentId: number
  workspaceUsers: any
  caseData: Case[]
  isContextMenu: boolean
  currentFileName: string
  currentFileIdByContext: number
  contextFileType: string
  pendingNotification: {
    isPending: boolean
    pendingText: string
    isDone: boolean
  }
  shareFormOpen: boolean
  shareLinkData: any
  shareUpdateData: any
  searchFlag: boolean
  workspacePath: string
  isLoader: boolean
  mode: string
  collpaseOpen: boolean
  collapseFixed: boolean
}

export interface ViewerData {
  category: string
  subBreadcrumb: string
}

export type ServiceName =
  | 'Dropbox'
  | 'Twitter'
  | 'Google'
  | 'Microsoft'
  | 'Facebook'
  | 'Instagram'
  | 'Uber'
  | 'Lyft'
  | 'Cloud Account'
  | 'Computer'
  | 'Email'
  | 'Mobile'
  | 'Network Share'
  | 'Server'
  | 'USB Device'
  | 'Other'

export interface TotalFileSizeByCase {
  case_id: number
  totalSize: number
}

export interface FolderTreeItem {
  id: number
  data_id: number
  access: string
  icon: string
  name: string
  modifiedDate: string
  notes: string
  owner: string
  size: number
  type: string
  tooltip: string
  parent_id: number | undefined
  selected?: boolean
  path: string
  expanded?: boolean
  hasChild?: boolean
  fileType?: string
  groupType?: GroupType
  dataType?: string
  file_type_name?: string
}

export interface CollapseOption {
  workgroup: boolean
  personal: boolean
  share: boolean
  recycle: boolean
}

export interface AssignedUserCount {
  caseId: number
  userNumber: number
}
