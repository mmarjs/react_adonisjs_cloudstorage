import { WorkGroupFileStatus } from 'App/types'

export interface WorkSpaceSearchBody {
  search_type: 'simple' | 'advanced'
  filename?: string
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

export interface WorkSpaceSearchQueryConditions {
  conditions: string
  params: { [key: string]: string | number | number[] }
}
