import { EventName, AccountRole } from 'types'

export default class NotificationMap {
  public event: EventName
  public role: AccountRole

  constructor(event: EventName, role: AccountRole) {
    this.event = event
    this.role = role
  }

  public isNotifableEvent(): boolean {
    if (this.role === 'account-owner') {
      return this.accountOwner().includes(this.event)
    }

    if (this.role === 'account-admin') {
      return this.accountAdmin().includes(this.event)
    }

    if (this.role === 'case-manager') {
      return this.caseManager().includes(this.event)
    }

    if (this.role === 'client-user') {
      return this.clientUser().includes(this.event)
    }

    return false
  }

  private accountOwner(): EventName[] {
    return [
      'case-created',
      'case-archived',
      'case-deleted',
      'user-added-to-company',
      'user-removed-from-company',
      'user-added-to-case',
      'user-removed-from-case',
      'files-uploaded',
      'files-downloaded',
      'share-link-created',
      'share-link-clicked',
      'share-link-files-uploaded',
      'share-link-files-downloaded',
    ]
  }

  private accountAdmin(): EventName[] {
    return [
      'case-created',
      'case-archived',
      'case-deleted',
      'user-added-to-company',
      'user-removed-from-company',
      'user-added-to-case',
      'user-removed-from-case',
      'files-uploaded',
      'files-downloaded',
      'share-link-created',
      'share-link-clicked',
      'share-link-files-uploaded',
      'share-link-files-downloaded',
    ]
  }

  private caseManager(): EventName[] {
    return [
      'case-created',
      'case-archived',
      'case-deleted',
      'user-added-to-case',
      'user-removed-from-case',
      'files-uploaded',
      'files-downloaded',
      'share-link-created',
      'share-link-clicked',
      'share-link-files-uploaded',
      'share-link-files-downloaded',
    ]
  }

  private clientUser(): EventName[] {
    return [
      'case-archived',
      'case-deleted',
      'user-added-to-case',
      'user-removed-from-case',
      'files-uploaded',
      'files-downloaded',
      'share-link-created',
      'share-link-clicked',
      'share-link-files-uploaded',
      'share-link-files-downloaded',
    ]
  }
}
