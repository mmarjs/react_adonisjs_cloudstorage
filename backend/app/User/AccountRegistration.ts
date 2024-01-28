import cuid from 'cuid'
import Log from 'App/Lib/Log'
import { randomBytes } from 'crypto'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import Role from 'App/Models/Role'
import PersonalFolder from 'App/Models/PersonalFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import PasswordHasher from 'App/Auth/PasswordHasher'
import EventDispatcher from 'App/Event/EventDispatcher'
import { RegisterAccountOwnerInput, Either } from 'App/types'
import SettingsMaker from 'App/Notification/SettingsMaker'

export default class AccountRegistration {
  public input: RegisterAccountOwnerInput

  constructor(input: RegisterAccountOwnerInput) {
    this.input = input
  }

  public async register(): Promise<Either<boolean>> {
    try {
      const res = await this.createAccountOwner()

      if (res === null) {
        return { error: 'failed-to-register' }
      }

      const data = {
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        email: res.user.email,
        verificationToken: res.user.verificationToken,
      }

      await EventDispatcher.dispatch({
        userId: res.user.id,
        companyId: res.company.id,
        name: 'account-registered',
        data: data,
      })

      return { error: null, success: true }
    } catch (err) {
      Log(err)
      if (err?.code === 'ER_DUP_ENTRY') {
        return { error: 'duplicate-entry' }
      }

      return { error: 'failed-to-register' }
    }
  }

  protected async createAccountOwner() {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { password, email, first_name, last_name, account_name } = this.input

    const salt = randomBytes(32).toString('hex')
    const passwordHasher = new PasswordHasher(password, salt)
    const hashedPassword = await passwordHasher.hash()

    if (hashedPassword.length === 0) {
      return null
    }

    const res = await Database.transaction(async (trx) => {
      const user = new User()
      user.useTransaction(trx)
      user.email = email
      user.password = hashedPassword
      user.salt = salt
      user.firstName = first_name
      user.lastName = last_name
      user.companyName = account_name
      user.verificationToken = cuid()
      user.channel = cuid()
      await user.save()

      const company = new Company()
      company.useTransaction(trx)
      company.userId = user.id
      company.name = account_name
      company.isEnterprise = false
      company.isEnterpriseSubscriber = false
      company.billingStatus = 'unactivated'
      company.maxEmployees = 10
      company.channel = cuid()
      await company.save()

      await Role.addRole(user.id, company.id, 'account-owner', trx)

      const settingMaker = new SettingsMaker(user.id, company.id, 'account-owner')
      await settingMaker.make(trx)

      const folder = new PersonalFolder()
      folder.useTransaction(trx)
      folder.name = 'Personal'
      folder.userId = user.id
      folder.companyId = company.id
      folder.parentId = 0
      folder.status = 'active'
      folder.access = 'private'
      await folder.save()

      if (!user.$isPersisted) {
        await trx.rollback()
        return null
      }

      return { user, company }
    })

    return res
  }
}
