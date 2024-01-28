import Event from 'App/Models/Event'
import Case from 'App/Models/Case'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

export default class CaseArchived {
  public static async handle(event: Event) {
    const user = await Event.getUser(event.id)
    const c = await Case.find(event.resourceId)
    const message = `${user.first_name} ${user.last_name} has archived the ${c?.caseName} case.`

    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
