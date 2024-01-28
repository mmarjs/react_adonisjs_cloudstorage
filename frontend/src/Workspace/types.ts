import { DownloadCategory } from 'types'
export type WorkGroupFolderStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export type PersonalFolderStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export type WorkGroupFileStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export type PersonalFileStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export type GroupType = 'workgroup' | 'personal'

export interface WorkGroupDirectoryParams {
  folderId: number
  status: WorkGroupFolderStatus
}

export interface WorkGroupFolderItem {
  id: number
  parent_id: number
  name: string
  status: WorkGroupFolderStatus
  owner_name: string
  notes: string
  access: 'private' | 'shared'
  updated_at: string
  path: string
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

export interface PersonalFolderItem {
  id: number
  parent_id: number | null
  name: string
  status: PersonalFolderStatus
  notes: string
  access: 'private' | 'shared'
  updated_at: string
  path: string
}

export interface PersonalFileItem {
  id: number
  personal_folder_id: number
  file_type_id: number
  name: string
  path: string
  size: number
  access: 'private' | 'shared'
  status: PersonalFileStatus
  owner_name: string
  notes: string
  date_created: string
  last_modified: string
  last_accessed: string
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

export interface WorkspaceRecycleBinItem {
  personalData: {
    activeFolderFiles: PersonalFileItem[]
    trashedFolderfiles: PersonalFileItem[]
    folders: PersonalFolderItem[]
  }
  workGroupData: {
    activeFolderFiles: WorkGroupFileItem[]
    trashedFolderfiles: WorkGroupFileItem[]
    folders: WorkGroupFolderItem[]
  }
}

export interface DeleteFileJobParams {
  id: number
  type: 'file' | 'folder'
  category: 'workgroup' | 'personal'
}

export interface ContextMenuItem {
  text: string
}

export interface ShareDataItem {
  delete?: boolean
  email: string
  expires: number
  message?: string
  password: string
  subject: string
  updatePassword?: true
  date?: string
  time?: string
}

export interface SearchTableDataItem {
  id: number
  data_id: number
  access: string
  fileType: string
  folder: string
  groupType: string
  icon: string
  modifiedDate: string
  name: string
  notes: string
  owner: string
  parent: number | undefined
  parent_Id: number | undefined
  size: number
  type: string
}

export interface AdvancedSearchFilterItem {
  access: number
  location: number
  modifieddate: number
  name: string
  owner: number
  sizecondition: number
  type: string
  size?: string
  sizetype?: number
  firstdate?: string
  seconddate?: string
  extension?: string
}

export interface SearchFileDataItem {
  access: string
  created_at: string
  date_created: string
  fileType: {
    id: number
    name: string
  }
  file_type_id: number
  folder: {
    id: number
    name: string
  }
  id: number
  last_accessed: string
  last_accessed_by_id: number
  last_modified: string
  name: string
  notes: string | null
  owner_id: number
  owner_name: string
  path: string
  size: number
  status: string
  updated_at: string
  work_group_folder_id?: number
  personal_folder_id?: number
}

export type BuildZipResource = 'workgroup' | 'personal'

export interface BuildZipFileParams {
  resource: DownloadCategory
  resourceId: number
  parentId: number
  files: number[]
  folders: number[]
  shareLinkId?: number
}

export interface ExportFile {
  id: number
  parent_id: number
}

export interface ExportFolder {
  id: number
  parent_id: number
}

export interface Paginator {
  current_page: number
  page: number
  pages: number[]
  per_page: number
  total: number
}
