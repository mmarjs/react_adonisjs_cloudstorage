import { UploadCategory } from 'types'

export type FileAccessCategory = 'workgroup' | 'personal' | 'evidence' | 'shared'

export interface ActiveFileItem {
  resource: UploadCategory
  folder_id: number
  filename: string
  size: number
  path: string
  last_modified: string
  status: 'pending' | 'uploaded' | 'crashed'
}

export interface ActiveFileParams {
  files: ActiveFileItem[]
}

export interface WasabiTempCredentialsParams {
  resource: FileAccessCategory
  id: number
}
