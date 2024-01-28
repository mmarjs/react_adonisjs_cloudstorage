import User from 'App/Models/User'
import Company from 'App/Models/Company'
import Permission from 'App/Models/Permission'
import Role from 'App/Models/Role'
import { isNumber } from 'lodash'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import PermissionMaker from 'App/Lib/PermissionMaker'
import { UpdateAccountUser, Either } from 'App/types'
import UserInvitation from 'App/Models/UserInvitation'
import EventDispatcher from 'App/Event/EventDispatcher'
import RemoveUser from 'App/User/RemoveUser'
import Logger from '@ioc:Adonis/Core/Logger'
import Email from 'App/Mail/Email'
import { roleNameWithPrefix, getItemReplacementList } from 'App/Lib/Helpers'
import MultipleAccountNoticeEmail from 'App/Mail/Emails/MultipleAccountNoticeEmail'
import UserInvitationEmail from 'App/Mail/Emails/UserInvitationEmail'

export default class AccountUserUpdater {
  public userId: number
  public companyId: number
  public actorId: number
  public body: UpdateAccountUser

  constructor(userId: number, companyId: number, actorId: number, body: UpdateAccountUser) {
    this.userId = userId
    this.companyId = companyId
    this.actorId = actorId
    this.body = body
  }

  public async update(): Promise<Either<User>> {
    const user = await User.find(this.userId)

    if (user === null) {
      return { error: 'no-such-user' }
    }

    if (this.body.status === 'deleted') {
      Logger.info('invoking remove user')
      const removeUser = new RemoveUser(this.userId, this.companyId, {
        userId: this.actorId,
        companyId: this.companyId,
      })

      Logger.info('removing user')
      const isUserDataDeleted = await removeUser.remove()

      if (isUserDataDeleted.error !== null) {
        Logger.info('error removing user')
        return { error: isUserDataDeleted.error }
      }

      Logger.info('user successfully removed')
      return { error: null, success: user }
    }

    const isUpdated = await this.updateUserDetails(user)

    if (!isUpdated) {
      return { error: 'user-update-failed' }
    }

    await this.updateAllowedCases(user.id, this.companyId)
    await user.refresh()

    return { error: null, success: user }
  }

  private async resendInvitationEmail(user: User) {
    const currRole = await Role.currentRole(user.id, this.companyId)
    const role = roleNameWithPrefix(currRole)
    const company = await Company.query().select('name').where('id', this.companyId).first()
    const companyName = company?.name ?? 'a company on Evidence Locker'
    const subject = `${companyName} has invited you to Evidence Locker`
    const companies = await Role.companies(user.id)
    const invitation = await UserInvitation.query()
      .select('id', 'code')
      .where('user_id', this.userId)
      .first()

    if (invitation !== null) {
      await UserInvitation.query()
        .where('id', invitation.id)
        .update({ expiresAt: DateTime.local().plus({ days: 2 }).toISO() })
        .limit(1)
    }
    const actorDetails = await User.findOrFail(this.actorId)

    const html = () => {
      if (companies.length > 1 || invitation === null) {
        return MultipleAccountNoticeEmail.html(
          user.firstName,
          companyName,
          role,
          actorDetails.fullName
        )
      } else {
        const link = `${Env.get('FRONTEND_URL')}/invitation/${invitation?.code}`
        return UserInvitationEmail.html(user.firstName, companyName, role, link)
      }
    }

    const email = new Email(user.email, subject, html())
    await email.send()
  }

  private async updateUserDetails(user: User) {
    if (this.body.first_name) {
      user.firstName = this.body.first_name
    }

    if (this.body.last_name) {
      user.lastName = this.body.last_name
    }

    if (this.body.company_name) {
      user.companyName = this.body.company_name
    }

    if (this.body.phone) {
      user.phone = this.body.phone
    }

    if (this.body.street) {
      user.street = this.body.street
    }

    if (this.body.city) {
      user.city = this.body.city
    }

    if (this.body.state) {
      user.state = this.body.state
    }

    if (this.body.zip) {
      if (isNumber(this.body.zip) && this.body.zip > 0) {
        user.zip = this.body.zip
      }
    }

    if (this.body.status === 'suspended') {
      user.status = 'suspended'
    }

    if (this.body.status === 'active') {
      user.status = 'active'
    }

    if (this.body.role) {
      await Role.switchRole(user.id, this.companyId, this.body.role)
    }

    await user.save()

    if (!user.$isPersisted) {
      return false
    }

    if (user.status === 'invited') {
      await this.resendInvitationEmail(user)
    }

    return true
  }

  private async updateAllowedCases(userId: number, companyId: number) {
    const role = await Role.currentRole(userId, companyId)

    if (!['case-manager', 'client-user'].includes(role)) {
      return false
    }

    const newCaseIds = this.body.permitted_cases as number[]

    const permissions = await Permission.query()
      .select('resource_id')
      .withScopes((scopes) => scopes.byResource(this.userId, this.companyId, 'case'))

    const currentCaseIds = permissions.map((c) => c.resourceId)

    const { itemsToAdd, itemsToDelete } = getItemReplacementList(currentCaseIds, newCaseIds)

    await Database.transaction(async (trx) => {
      if (itemsToDelete.length > 0) {
        await Permission.query({ client: trx })
          .where('resource', 'case')
          .whereIn('resource_id', itemsToDelete)
          .limit(itemsToDelete.length)
          .delete()
      }

      if (itemsToAdd.length > 0) {
        for (let caseId of itemsToAdd) {
          if (role === 'case-manager') {
            await PermissionMaker.make(
              this.userId,
              this.companyId,
              caseId,
              'case',
              Permission.actions,
              trx
            )
          }

          if (role === 'client-user') {
            await PermissionMaker.make(
              this.userId,
              this.companyId,
              caseId,
              'case',
              ['read', 'write'],
              trx
            )
          }
        }
      }
    })

    if (itemsToAdd.length > 0) {
      for (let caseId of itemsToAdd) {
        await EventDispatcher.dispatch({
          userId: this.actorId,
          companyId: companyId,
          name: 'user-added-to-case',
          resource: 'case',
          resourceId: caseId,
          data: {
            userId: this.userId,
            companyId: this.companyId,
          },
        })
      }
    }
  }
}
