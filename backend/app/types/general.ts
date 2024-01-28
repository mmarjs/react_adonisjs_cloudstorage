export type AxiosAuthType = 'bearer' | 'token'

export interface MailMessage {
  from?: string
  to: string
  subject: string
  html: string
}

export interface SlackMessage {
  message: string
  channel: 'general' | 'errors'
}

export type Some<T> = T | null

export type Option<T> = T | boolean

export interface StandardError {
  error: string
}

export interface StatusResponse {
  status: string
}

export type AccessLogResource =
  | 'case'
  | 'custodian'
  | 'evidence'
  | 'workgroup_folder'
  | 'workgroup_file'

export type AccessLogAction =
  | 'read'
  | 'write'
  | 'grant'
  | 'trash'
  | 'rename'
  | 'move'
  | 'update_status'

export interface Either<T> {
  error: null | string
  success?: T
}

export interface SpecificUser {
  userId: number
  companyId: number
}
