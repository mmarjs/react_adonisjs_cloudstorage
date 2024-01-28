import Event from 'App/Models/Event'
import Role from 'App/Models/Role'
import { roleNameWithPrefix } from 'App/Lib/Helpers'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

export default class UserAddedToCompany {
  public static async handle(event: Event) {
    const actor = await Event.getUser(event.id)
    const role = await Role.query().where({ id: event.resourceId }).preload('user').firstOrFail()
    const user = role.user
    const roleName = roleNameWithPrefix(role.role)

    const message = `${actor.first_name} ${actor.last_name} has added ${user.fullName} (${user.email}) as ${roleName} to ${actor.company_name}.`

    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
