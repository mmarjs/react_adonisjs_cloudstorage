export interface AdminUserAction {
  user: string
  action: string
}

export interface BulkImportLoginParams {
  email: string
  password: string
  caseId: number
}

export interface BulkImportLoginResponse {
  token: string
  userName: string
  caseName: string
  companyName: string
  rootWorkGroupFolderId: number
}

export interface CreatePendingImportFileParams {
  filename: string
  caseId: number
  work_group_folder_id: number
  size: number
  atime: string
  mtime: string
  birthtime: string
}

export interface ActivateImportFileParams {
  work_group_file_id: number
}
