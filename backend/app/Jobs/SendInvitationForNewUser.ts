import Log from 'App/Lib/Log'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { roleNameWithPrefix } from 'App/Lib/Helpers'
import UserInvitation from 'App/Models/UserInvitation'
import UserInvitationEmail from 'App/Mail/Emails/UserInvitationEmail'
import MultipleAccountNoticeEmail from 'App/Mail/Emails/MultipleAccountNoticeEmail'
import JobDispatcher from 'App/Jobs/JobDispatcher'
import EventDispatcher from 'App/Event/EventDispatcher'
import Env from '@ioc:Adonis/Core/Env'
import { JobParams, SpecificUser, MailMessage } from 'App/types'

interface ParamData {
  actor: SpecificUser
  user: SpecificUser
}

export default class SendInvitationForNewUser {
  public static async run(job: JobParams) {
    const { actor, user: target } = job.data as ParamData

    try {
      const invitation = await UserInvitation.query()
        .where({ userId: target.userId })
        .where({ companyId: target.companyId })
        .preload('user')
        .firstOrFail()

      const user = invitation.user

      const role = await Role.query()
        .where({ userId: user.id })
        .where({ companyId: target.companyId })
        .preload('company')
        .firstOrFail()

      const actorDetails = await User.findOrFail(actor.userId)

      const roleName = roleNameWithPrefix(role.role)
      const company = role.company
      const subject = `${company.name} has invited you to Evidence Locker`
      const companies = await Role.companies(user.id)

      let html = () => {
        if (companies.length > 1) {
          return MultipleAccountNoticeEmail.html(
            user.firstName,
            company.name,
            roleName,
            actorDetails.fullName
          )
        } else {
          const link = `${Env.get('FRONTEND_URL')}/invitation/${invitation.code}`
          return UserInvitationEmail.html(user.firstName, company.name, actorDetails.fullName, link)
        }
      }

      const email: MailMessage = {
        to: user.email,
        subject: subject,
        html: html(),
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

      return true
    } catch (err) {
      Log(err)
      return false
    }
  }
}
