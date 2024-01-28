export interface DeleteFileJobParams {
  id: number
  type: 'file' | 'folder'
  category: 'workgroup' | 'personal'
}

export type FileAuditActions =
  | 'read'
  | 'create'
  | 'update'
  | 'rename'
  | 'move'
  | 'trash'
  | 'restore'
  | 'share'
  | 'copy'
  | 'transer'
  | 'download'

export interface DownloadFileParams {
  resource: FileAccessCategory
  id: number
  shareLinkId?: number
}

export type FileAuditResource =
  | 'work_group_folders'
  | 'work_group_files'
  | 'personal_folders'
  | 'personal_files'

export type FileAccessCategory = 'workgroup' | 'personal' | 'evidence' | 'shared'

export interface FileInfo {
  filename: string
  path: string
  folderName: string
}

export interface ActivateFileBody {
  category: FileAccessCategory
  file_id: number
}

export interface CreatePendingFileBody {
  filename: string
  category: FileAccessCategory
  category_id: number
  folder_id: number
  size: number
  access: 'private' | 'shared'
  last_modified: string
}

export interface HttpFileMetadata {
  contentType: string
  lastModified: string | null
}

export interface DownloadedFileData extends HttpFileMetadata {
  tmpFileName: string
  originalFileName: string
  fileSize: number
  md5: string
  sha1: string
}

export interface UploadFileData extends HttpFileMetadata {
  fileName: string
  fileSize: number
}

export interface BuildZipFileParams {
  resource: BuildZipResource
  resourceId: number
  parentId: number
  files: number[]
  folders: number[]
  shareLinkId?: number
}

export interface BuildZipFolder {
  id: number
}

export type BuildZipResource = 'workgroup' | 'personal'

export interface ZipExport {
  name: string
  files: ZipExportFile[]
  folders: ZipExportFolder[]
}

export interface ZipExportFolder {
  path: string
  files: ZipExportFile[]
}

export interface ZipExportFile {
  wasabiPath: string
  name: string
  size: number
}

export interface ActiveFileItem {
  resource: FileAccessCategory
  folder_id: number
  filename: string
  size: number
  path: string
  last_modified: string
}

export interface ActiveFileParams {
  folderId: number
  resource: 'workgroup' | 'personal'
  files: ActiveFileItem[]
  shareLinkId?: number
}

export interface CreateActiveFileParams extends ActiveFileItem {
  userId: number
  fileTypeId: number
}

export interface WasabiTempCredentialsParams {
  resource: FileAccessCategory
  id: number
}

export interface DeleteFolderResponse {
  folderName: string
  fileIds: number[]
}
