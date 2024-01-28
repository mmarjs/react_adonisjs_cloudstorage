import Event from 'App/Models/Event'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

interface EventParams {
  message: string
  shareLinkId: number
}

export default class ShareLinkCreated {
  public static async handle(event: Event) {
    const { message } = event.data as EventParams
    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
