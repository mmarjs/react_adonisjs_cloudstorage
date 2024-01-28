import Event from 'App/Models/Event'
import Case from 'App/Models/Case'
import User from 'App/Models/User'
import { SpecificUser } from 'App/types'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

export default class UserRemovedFromCase {
  public static async handle(event: Event) {
    const data = event.data as SpecificUser

    const actor = await Event.getUser(event.id)
    const caseInstance = await Case.findOrFail(event.resourceId)
    const user = await User.findOrFail(data.userId)

    const message = `${actor.first_name} ${actor.last_name} has removed ${user.fullName} from the ${caseInstance.caseName} case.`

    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
