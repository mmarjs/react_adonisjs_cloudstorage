import Event from 'App/Models/Event'
import User from 'App/Models/User'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

export default class UserVerified {
  public static async handle(event: Event) {
    const user = await User.findOrFail(event.resourceId)
    const message = `${user.fullName} has accepted their invitation their user account.`

    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
