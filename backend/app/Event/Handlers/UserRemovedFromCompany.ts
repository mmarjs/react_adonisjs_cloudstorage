import Event from 'App/Models/Event'
import { roleNameWithPrefix } from 'App/Lib/Helpers'
import NotificationProcessor from 'App/Notification/NotificationProcessor'
import { AccountRole } from 'App/types'

interface ParamData {
  role: AccountRole
  name: string
  email: string
}

export default class UserRemovedCompany {
  public static async handle(event: Event) {
    const actor = await Event.getUser(event.id)
    const { role, name, email } = event.data as ParamData
    const roleName = roleNameWithPrefix(role)

    const message = `${actor.first_name} ${actor.last_name} has deleted ${name} (${email}), ${roleName} from ${actor.company_name}.`

    const processor = new NotificationProcessor(event, message)
    return await processor.process()
  }
}
