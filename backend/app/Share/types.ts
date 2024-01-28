export interface CreateShareLinkBody {
  email: string
  password: string
  identifier: string
  subject: string
  message?: string
  expiresAt?: string
  shareType: 'upload' | 'download'
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

export interface ShareInvitationEmailParams {
  email: string
  password: string
  link: string
  subject: string
  grantorName: string
  grantorCompany: string
  message?: string
}

export interface ShareUpdateBody {
  expiry?: string
  password?: string
  resend?: boolean
}

export interface ShareDataScreenParams {
  folderIds: number[]
  fileIds: number[]
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
