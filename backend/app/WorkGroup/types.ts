export type WorkGroupFolderStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export type WorkGroupFileStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export interface CreateWorkGroupFileParams {
  user_id: number
  work_group_folder_id: number
  file_type_id: number
  name: string
  path: string
  size: number
  access: 'private' | 'shared'
  status: WorkGroupFileStatus
  owner_name: string
  notes?: string
  last_modified: string
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

export interface WorkGroupFolderTreeItem extends WorkGroupFolderItem {
  hasFolders: boolean
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
  file_type_name?: string
  fileType: {
    id: number
    name: string
  }
  folder: {
    id: number
    name: string
  }
}

export interface WorkGroupTransfer {
  userId: number
  folderIds: number[]
  fileIds: number[]
}

export interface MoveWorkGroupFolderBody {
  caseId: number
  folderId: number
  newParentId: number
}

export interface MoveWorkGroupFilesBody {
  caseId: number
  fileIds: number[]
  nextFolderId: number
}

export interface RenameWorkGroupFolderBody {
  caseId: number
  folderId: number
  name: string
}

export interface RenameWorkGroupFileBody {
  caseId: number
  fileId: number
  name: string
}

export interface UpdateWorkGroupFolderStatusBody {
  caseId: number
  folderId: number
  status: WorkGroupFolderStatus
}

export interface UpdateWorkGroupFileStatusBody {
  caseId: number
  fileIds: number[]
  status: WorkGroupFileStatus
}

export interface CreateWorkGroupFolderBody {
  caseId: number
  parentId: number
  name: string
}

export interface WorkGroupDirectory {
  folders: WorkGroupFolderItem[]
  files: WorkGroupFileItem[]
}

export interface WorkGroupDirectoryParams {
  folderId: number
  status: WorkGroupFolderStatus
}

export interface CreateWorkGroupFolderPipelineParams {
  caseId: number
  parentId: number
  ownerId: number
  companyId: number
  name: string
}

export interface WorkGroupFolderTreeItem {
  id: number
  parent_id: number
  name: string
  path: string
}
