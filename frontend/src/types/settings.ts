import { EventName } from 'types'

export interface NotificationSetting {
  id: number
  event: EventName
  sendApp: boolean
  sendEmail: boolean
}

export interface UpdateSettingsParams {
  column: 'sendApp' | 'sendEmail'
  value: boolean
}

export type PreferenceName =
  | 'collapse-main-menu-bar'
  | 'hide-archived-cases'
  | 'show-case-card-view'

export interface Preference {
  id: number
  name: PreferenceName
  option: boolean
}

export interface UpdatePreferenceParams {
  option: boolean
}
