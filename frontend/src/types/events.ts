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
