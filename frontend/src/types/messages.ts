import { EventName, PolicyResource } from 'types'

export enum ServerSentEvents {
  accountUpdated = 'account:updated',
  caseStored = 'case:stored',
  caseUpdated = 'case:updated',
  dashboardUpdate = 'dashboard:update',
  invitationAccepted = 'invitation:accepted',
  invitationOpened = 'invitation:opened',
  notificationShown = 'notifications:shown',
  notificationsUpdated = 'notifications:updated',
  userInvited = 'user:invited',
  userStored = 'user:stored',
  userUpdated = 'user:updated',
}

export enum QueryKey {
  caseFormScreen = 'case-form-screen',
  collectionAccountScreen = 'collection-account-screen',
  cloudAcquisitionScreen = 'cloud-acquisition-screen',
  dashboardScreen = 'dashboard-screen',
  manageCaseScreen = 'manage-case-screen',
  manageUserScreen = 'manage-user-screen',
  newUserScreen = 'new-user-screen',
  showUserScreen = 'show-user-screen',
  notificationSettings = 'notification-settings',
  showCaseScreen = 'show-case-screen',
  workGroupScreen = 'show-workgroup-screen',
  personalScreen = 'show-personal-screen',
  workSpaceTableScreen = 'show-workspacetable-screen',
  workspaceScreen = 'show-workspace-screen',
  workspaceShareLink = 'show-workspace-sharelink',
  workspaceShareUserData = 'show-workspace-shareuserdata-screen',
  shareLinkStatus = 'share-link-status',
  switchCompanyScreen = 'switch-company-screen',
  assignedUserScreen = 'assigned-user-screen',
  workspaceInitialScreen = 'show-workspace-initial-screen',
}

export interface PusherEvent {
  event: EventName
  subject: string
  message: string
  resource: PolicyResource | null
  resourceId: number | null
}
