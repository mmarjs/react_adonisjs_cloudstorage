import { PolicyResource } from 'App/types'

export type EventData = Record<string, any>

export type EventName =
  | 'case-created'
  | 'case-deleted'
  | 'case-archived'
  | 'account-registered'
  | 'user-verified-account'
  | 'user-added-to-company'
  | 'user-removed-from-company'
  | 'user-added-to-case'
  | 'user-removed-from-case'
  | 'multiple-failed-logins'
  | 'files-uploaded'
  | 'files-downloaded'
  | 'share-link-created'
  | 'share-link-files-uploaded'
  | 'share-link-files-downloaded'
  | 'share-link-clicked'
  | 'multiple-files-deleted'
  | 'event-handling-failed'

export interface EventParams {
  id: number
  name: string
}

export interface EventDispatchParams {
  userId: number
  companyId: number
  name: EventName
  resource?: PolicyResource
  resourceId?: number
  data?: EventData
}
