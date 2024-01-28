import { EventName, AccountRole, PolicyResource } from 'App/types'

export default class NotificationMap {
  public event: EventName

  constructor(event: EventName) {
    this.event = event
  }

  public notifiableRoles(): AccountRole[] {
    let roles: AccountRole[] = []

    if (this.accountOwner().includes(this.event)) {
      roles.push('account-owner')
    }

    if (this.accountAdmin().includes(this.event)) {
      roles.push('account-admin')
    }

    if (this.caseManager().includes(this.event)) {
      roles.push('case-manager')
    }

    if (this.clientUser().includes(this.event)) {
      roles.push('client-user')
    }

    return roles
  }

  public accountOwner(): EventName[] {
    return [
      'case-created',
      'case-archived',
      'case-deleted',
      'user-added-to-company',
      'user-verified-account',
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

  public accountAdmin(): EventName[] {
    return [
      'case-created',
      'case-archived',
      'case-deleted',
      'user-added-to-company',
      'user-verified-account',
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

  public caseManager(): EventName[] {
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

  public clientUser(): EventName[] {
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

  public superAdmins(): EventName[] {
    return [
      'case-created',
      'user-verified-account',
      'user-added-to-case',
      'share-link-created',
      'share-link-clicked',
    ]
  }

  public subject(): string {
    const map = new Map<EventName, string>()
    map.set('case-created', 'A case has been created')
    map.set('case-archived', 'A case has been archived')
    map.set('case-deleted', 'A case has been deleted')
    map.set('user-added-to-company', 'A user has been added to your organization')
    map.set('user-verified-account', 'A user as accepted an invitation')
    map.set('user-removed-from-company', 'A user has been removed from your organization')
    map.set('user-added-to-case', 'A user has been added to a case')
    map.set('user-removed-from-case', 'A user has been removed from a case')
    map.set('files-uploaded', 'Files were uploaded to a workgroup')
    map.set('files-downloaded', 'Files were downloaded from a workgroup')
    map.set('share-link-created', 'A share link has been created')
    map.set('share-link-clicked', 'A share link has been clicked')
    map.set('share-link-files-uploaded', 'Files were uploaded to a share link')
    map.set('share-link-files-downloaded', 'Files were downloaded to a share link')

    return map.get(this.event) ?? 'Notification'
  }

  public policyResource(): PolicyResource {
    const map = new Map<EventName, PolicyResource>()
    map.set('case-created', 'case')
    map.set('case-archived', 'case')
    map.set('case-deleted', 'case')
    map.set('user-added-to-company', 'role')
    map.set('user-verified-account', 'user')
    map.set('user-removed-from-company', 'role')
    map.set('user-added-to-case', 'case')
    map.set('user-removed-from-case', 'case')
    map.set('files-uploaded', 'case')
    map.set('files-downloaded', 'case')
    map.set('share-link-created', 'case')
    map.set('share-link-clicked', 'case')
    map.set('share-link-files-uploaded', 'case')
    map.set('share-link-files-downloaded', 'case')

    return map.get(this.event) ?? 'case'
  }
}
