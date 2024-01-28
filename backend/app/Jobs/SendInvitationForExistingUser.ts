import Debug from 'debug'
import Log from 'App/Lib/Log'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { roleNameWithPrefix } from 'App/Lib/Helpers'
import { JobParams, SpecificUser, MailMessage } from 'App/types'
import MultipleAccountNoticeEmail from 'App/Mail/Emails/MultipleAccountNoticeEmail'
import JobDispatcher from 'App/Jobs/JobDispatcher'
import EventDispatcher from 'App/Event/EventDispatcher'

interface ParamData {
  actor: SpecificUser
  user: SpecificUser
}

export default class SendInvitationForExistingUser {
  public static async run(job: JobParams) {
    const { actor, user: target } = job.data as ParamData
    const debug = Debug('jobs')

    try {
      debug('tryign to fetch role')
      const role = await Role.query()
        .where({ userId: target.userId })
        .where({ companyId: target.companyId })
        .preload('company')
        .preload('user')
        .firstOrFail()

      const actorDetails = await User.findOrFail(actor.userId)
      const roleName = roleNameWithPrefix(role.role)
      const user = role.user
      const company = role.company
      const subject = `${company.name} has invited you to Evidence Locker`
      const hmtl = MultipleAccountNoticeEmail.html(
        user.firstName,
        company.name,
        roleName,
        actorDetails.fullName
      )

      const email: MailMessage = {
        to: user.email,
        subject: subject,
        html: hmtl,
      }
      const slack = `*Description*: Sent ${roleName} invite to ${user.signature}.`

      await JobDispatcher.dispatch(actor.userId, actor.companyId, 'send-email', email)
      await JobDispatcher.dispatch(actor.userId, actor.companyId, 'send-slack', slack)

      await EventDispatcher.dispatch({
        userId: actor.userId,
        companyId: actor.companyId,
        name: 'user-added-to-company',
        resource: 'role',
        resourceId: role.id,
      })
    } catch (err) {
      Log(err)
    }
  }
}
