import { UploadCategory } from './forms'
import {
  WorkGroupFolderStatus,
  PersonalFolderStatus,
  WorkGroupFileStatus,
  PersonalFileStatus,
} from './responses'

export interface CreateWorkGroupFolderBody {
  caseId: number
  parentId: number | null
  name: string
}

export interface UpdateWorkGroupFolderStatusBody {
  caseId: number
  folderId: number
  status: WorkGroupFolderStatus
}

export interface RenameWorkGroupFolderBody {
  caseId: number
  folderId: number
  name: string | null
}
export interface CreatePendingFileBody {
  filename: string
  category: UploadCategory
  category_id: number
  folder_id: number
  size: number
  access: 'private' | 'shared'
  date_created: string
  last_modified: string
  last_accessed: string
}

export interface ActivateFileBody {
  category: UploadCategory
  categoryId: number
}

export interface CreatePersonalFolderBody {
  userId: number
  parentId: number | null
  name: string
}

export interface RenamePersonalFolderBody {
  userId: number
  folderId: number
  name: string | null
}

export interface UpdatePersonalFolderStatusBody {
  userId: number
  folderId: number
  status: PersonalFolderStatus
}

export interface UpdateWorkGroupFileStatusBody {
  caseId: number
  fileIds: number[]
  status: WorkGroupFileStatus
}

export interface UpdatePersonalFileStatusBody {
  userId: number
  fileIds: number[]
  status: PersonalFileStatus
}

export interface WorkSpaceSearchBody {
  search_type: 'simple' | 'advanced'
  filename: string
  folder_id: number
  status: WorkGroupFileStatus
  size?: {
    gt?: boolean
    lt?: boolean
    bytes: number
  }
  last_modified?: {
    exactly?: string
    before?: string
    after?: string
    between?: {
      before: string
      after: string
    }
  }
  access?: 'private' | 'shared'
  category: 'workgroup' | 'personal' | 'evidence' | 'shared'
  category_id: number
  file_type?: {
    category?: string
    extension?: string
  }
  owner?: {
    owner_id: number
  }
  page: number
  limit: number
}

export interface RenameWorkGroupFileBody {
  caseId: number
  fileId: number
  name: string
}

export interface RenamePersonalFileBody {
  userId: number
  fileId: number
  name: string
}

export interface CreateShareLinkBody {
  email: string
  password: string
  identifier: string
  subject: string
  message?: string
  expiresAt?: string
  shareType: 'upload' | 'download' | 'share'
  resource: ShareLinkType
  folderId: number
  canUpdatePassword?: boolean
  canTrash?: boolean
  items: ShareResourceItem[]
}
export type ShareLinkType = 'work_group' | 'personal'

export type ShareResourceType =
  | 'work_group_folders'
  | 'work_group_files'
  | 'personal_folders'
  | 'personal_files'

export interface ShareResourceItem {
  resource: ShareResourceType
  resourceId: number
}

export interface ShareLoginInput {
  email: string
  password: string
  link: string
  firstName?: string
  lastName?: string
  phone?: string
  companyName?: string
}

interface ShareUpdateUser {
  firstName?: string
  lastName?: string
  phone?: string
  companyName?: string
}

export interface ShareUpdateUserBody {
  loginData: any
  userData: ShareUpdateUser
}

export interface CaseSearchParams {
  type: 'simple' | 'advanced'
  search: string
  companyId: number
  showArchived?: boolean
}

export interface CasePermissionParams {
  userId: number
  companyId: number
  resourceId: number
}

export interface WorkGroupDirectoryParams {
  folderId: number
  status: WorkGroupFolderStatus
}
