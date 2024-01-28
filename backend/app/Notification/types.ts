import { EventName } from 'App/types'

export interface UpdateNotificationSettingsParams {
  settingId: number
  event: EventName
  sendApp: boolean
  sendEmail: boolean
}

export interface UserNotificationJobParams {
  email: string
  name: string
  message: string
}

export interface UpdateSettingsParams {
  column: 'sendApp' | 'sendEmail'
  value: boolean
}
