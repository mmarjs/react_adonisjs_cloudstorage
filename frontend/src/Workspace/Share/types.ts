export interface ShareLinkParam {
  link: string
}

export interface ShareLoginParams {
  firstName: string
  lastName: string
  company?: string
  phone?: number
  email: string
  password: string
}

export interface ShareDataAPIResponse {
  caseId: number
  userId: number
  folders: any[]
  files: any[]
}

export interface ShareLoginResponse {
  token: string
  shareLink: ShareLink
}

export interface ShareLinkStatusResponse {
  grantor: string
  company: string
  expiration: string
  hasLoggedInBefore: boolean
}

export interface ShareLink {
  id: number
  granted_by_id: number
  link: string
  first_name: string
  last_name: string
  resource: string
  resource_id: number
  folder_id: number
  can_update_password: boolean
  can_trash: boolean
  share_type: 'upload' | 'download'
  expires_at: string | null
}

export interface SharedWorkGroupFile {
  access: 'private' | 'shared'
  created_at: string
  date_created: string
  fileType: { name: string; id: number }
  file_type_id: number
  id: number
  last_accessed: string
  last_accessed_by_id: number
  last_modified: string
  name: number
  notes: string | null
  owner_id: number
  owner_name: string
  path: string
  size: number
  status: string
  updated_at: string
  work_group_folder_id: number
}

export interface ShareWorkGroupFolder {
  id: number
  name: string
  notes: string | null
  owner_name: string
  parent_id: number
  status: string
  updated_at: string
}

export interface ShareDataStore {
  loggedIn: boolean
  timestamp?: string
  token: string
  shareLink: ShareLink
  files: any[]
  sharedFileData: any
  grantor: string
  grantorCompany: string
  hasLoggedInBefore: boolean
}

export interface ShareUpdateLinkBody {
  linkId: number
  updateData: ShareUpateLink
}

interface ShareUpateLink {
  expiry?: string
  password?: string
  resend?: boolean
}
