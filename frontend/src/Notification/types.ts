import { EventName } from 'types'

export interface Notification {
  id: number
  event: EventName
  message: string
  created_at: string
}
