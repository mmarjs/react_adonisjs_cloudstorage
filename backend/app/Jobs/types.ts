export type JobName =
  | 'create-active-files'
  | 'delete-file'
  | 'delete-folder'
  | 'send-email'
  | 'send-slack'
  | 'send-invitation-for-new-user'
  | 'send-invitation-for-existing-user'
  | 'send-share-link'

export interface JobParams {
  actorId: number | null
  companyId: number | null
  name: JobName
  data: unknown
}
