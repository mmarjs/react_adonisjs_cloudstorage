import cuid from 'cuid'
import { toSafeInteger } from 'lodash'
import { randomBytes } from 'crypto'
import has from 'App/Lib/Has'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Company from 'App/Models/Company'
import Permission from 'App/Models/Permission'
import PasswordHasher from 'App/Auth/PasswordHasher'
import Database from '@ioc:Adonis/Lucid/Database'
import UserInvitation from 'App/Models/UserInvitation'
import PermissionMaker from 'App/Lib/PermissionMaker'
import SettingsMaker from 'App/Notification/SettingsMaker'
import PreferenceMaker from 'App/Preference/PreferenceMaker'
import JobDispatcher from 'App/Jobs/JobDispatcher'
import EventDispatcher from 'App/Event/EventDispatcher'
import { UserInvitationBody, Either, SpecificUser } from 'App/types'

export default class Invitation {
  public data: UserInvitationBody
  public company: Company
  public actor: SpecificUser

  constructor(data: UserInvitationBody, actor: SpecificUser, company: Company) {
    this.data = data
    this.actor = actor
    this.company = company
  }

  public async invite(): Promise<Either<string>> {
    const { current, max } = await Company.employeeInfo(this.company.id)

    if (current === max) {
      return { error: 'no-avaialable-employees' }
    }

    let user = await User.query().where('email', this.data.email).first()

    if (user !== null) {
      return await this.handleExistingUser(user)
    }

    return await this.handleNewUser()
  }

  private async handleNewUser(): Promise<Either<string>> {
    // This is done because the password can't be null. The user will set their own later
    const salt = randomBytes(32).toString('hex')
    const hasher = new PasswordHasher(cuid(), salt)
    const password = await hasher.hash()

    const invitation = await Database.transaction(async (trx) => {
      const user = new User()
      user.useTransaction(trx)
      user.email = this.data.email
      user.salt = salt
      user.password = password
      user.firstName = this.data.first_name
      user.lastName = this.data.last_name
      user.status = 'invited'
      user.phone = this.data?.phone ?? null
      user.street = this.data?.street ?? null
      user.state = this.data?.state ?? null

      if (has(this.data, 'zip')) {
        const safeZip = toSafeInteger(this.data.zip)
        user.zip = safeZip
      }

      user.companyName = this.data?.company_name ?? null
      user.verificationToken = cuid()
      user.channel = cuid()
      await user.save()

      await Role.addRole(user.id, this.company.id, this.data.role, trx)

      const settings = new SettingsMaker(user.id, this.company.id, this.data.role)
      await settings.make(trx)

      const prefs = new PreferenceMaker(user.id, this.company.id)
      await prefs.make(trx)

      if (this.data.role === 'case-manager') {
        for (let caseId of this.data?.permitted_cases ?? []) {
          await PermissionMaker.make(
            user.id,
            this.company.id,
            caseId,
            'case',
            Permission.actions,
            trx
          )
        }
      }

      if (this.data.role === 'client-user') {
        for (let caseId of this.data?.permitted_cases ?? []) {
          await PermissionMaker.make(
            user.id,
            this.company.id,
            caseId,
            'case',
            ['read', 'write'],
            trx
          )
        }
      }

      const invitation = new UserInvitation()
      invitation.useTransaction(trx)
      invitation.userId = user.id
      invitation.companyId = this.company.id
      invitation.code = cuid()
      invitation.status = 'sent'
      invitation.expiresAt = DateTime.local().plus({ days: 7 })
      await invitation.save()

      if (!invitation.$isPersisted) {
        return null
      }

      return invitation
    })

    if (invitation === null) {
      return { error: 'could-not-create-invitation' }
    }

    await JobDispatcher.dispatch(
      this.actor.userId,
      this.actor.companyId,
      'send-invitation-for-new-user',
      {
        actor: this.actor,
        user: { userId: invitation.userId, companyId: invitation.companyId },
      }
    )

    if (this.data.permitted_cases && this.data.permitted_cases.length > 0) {
      for (let caseId of this.data.permitted_cases) {
        await EventDispatcher.dispatch({
          userId: this.actor.userId,
          companyId: this.actor.companyId,
          name: 'user-added-to-case',
          resource: 'case',
          resourceId: caseId,
          data: {
            userId: invitation.userId,
            companyId: invitation.companyId,
          },
        })
      }
    }

    return { error: null, success: 'user-invited' }
  }

  private async handleExistingUser(user: User): Promise<Either<string>> {
    await Database.transaction(async (trx) => {
      await Role.addRole(user.id, this.data.company_id, this.data.role, trx)

      if (this.data.role === 'case-manager') {
        for (let caseId of this.data?.permitted_cases ?? []) {
          await PermissionMaker.make(
            user.id,
            this.company.id,
            caseId,
            'case',
            Permission.actions,
            trx
          )
        }
      }

      if (this.data.role === 'client-user') {
        for (let caseId of this.data?.permitted_cases ?? []) {
          await PermissionMaker.make(
            user.id,
            this.company.id,
            caseId,
            'case',
            ['read', 'write'],
            trx
          )
        }
      }
    })

    await JobDispatcher.dispatch(
      user.id,
      this.data.company_id,
      'send-invitation-for-existing-user',
      {
        actor: this.actor,
        user: { userId: user.id, companyId: this.company.id },
      }
    )

    if (this.data.permitted_cases && this.data.permitted_cases.length > 0) {
      for (let caseId of this.data.permitted_cases) {
        await EventDispatcher.dispatch({
          userId: this.actor.userId,
          companyId: this.company.id,
          name: 'user-added-to-case',
          resource: 'case',
          resourceId: caseId,
          data: {
            userId: user.id,
            companyId: this.company.id,
          },
        })
      }
    }

    return { error: null, success: 'user-invited' }
  }
}
