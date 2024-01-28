export type PersonalFolderStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

export type PersonalFileStatus = 'pending' | 'active' | 'updating' | 'trashed' | 'transferred'

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

export interface PersonalFolderChildItem extends PersonalFolderItem {
  hasFolders: boolean
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

export interface MovePersonalFolderBody {
  userId: number
  folderId: number
  newParentId: number
}

export interface MovePersonalFilesBody {
  userId: number
  fileIds: number[]
  nextFolderId: number
}

export interface RenamePersonalFolderBody {
  userId: number
  folderId: number
  name: string
}

export interface RenamePersonalFileBody {
  userId: number
  fileId: number
  name: string
}

export interface UpdatePersonalFolderStatusBody {
  userId: number
  folderId: number
  status: PersonalFolderStatus
}

export interface UpdatePersonalFileStatusBody {
  fileIds: number[]
  status: PersonalFileStatus
}

export interface CreatePersonalFolderBody {
  userId: number
  parentId: number
  name: string
}

export interface PersonalDirectory {
  folders: PersonalFolderItem[]
  files: PersonalFileItem[]
}

export interface PersonalDirectoryParams {
  folderId: number
  status: PersonalFolderStatus
}

export interface CreatePersonalFolderPipelineParams {
  userId: number
  parentId: number
  name: string
}

export interface PersonalFolderTreeItem {
  id: number
  parent_id: number
  name: string
  path: string
}
