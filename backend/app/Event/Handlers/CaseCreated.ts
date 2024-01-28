import Event from 'App/Models/Event'
import Case from 'App/Models/Case'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

export default class CaseCreated {
  public static async handle(event: Event) {
    const user = await Event.getUser(event.id)
    const c = await Case.findOrFail(event.resourceId)
    const message = `${user.first_name} ${user.last_name} at ${user.company_name} created a new case: ${c.caseName}.`

    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
