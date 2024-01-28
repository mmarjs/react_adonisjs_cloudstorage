import { randomBytes } from 'crypto'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class CreateUser extends BaseCommand {
  public static commandName = 'user:create'
  public static description = 'Create Account User'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: User } = await import('App/Models/User')
    const { default: Role } = await import('App/Models/Role')
    const { default: Company } = await import('App/Models/Company')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: NotificationSetting } = await import('App/Models/NotificationSetting')
    const { default: PasswordHasher } = await import('App/Auth/PasswordHasher')

    const allowedRoles = ['account-admin', 'case-manager', 'evidence-user']

    const companyId = Number((await this.prompt.ask('Enter company Id of import')).trim())

    const company = await Company.find(companyId)

    if (company === null) {
      this.logger.error(`${companyId} does not exist`)
      await this.exit()
    }

    const inputRole = (await this.prompt.ask(`Enter account role`)).trim()

    if (!allowedRoles.includes(inputRole)) {
      this.logger.error(`${inputRole} is not a valid role for an account user`)
      await this.exit()
    }

    const email = (await this.prompt.ask(`Enter email address`)).trim()
    const password = (await this.prompt.ask(`Enter password`)).trim()
    const firstName = (await this.prompt.ask(`Enter first name`)).trim()
    const lastName = (await this.prompt.ask('Enter last name')).trim()

    try {
      let user = await User.findBy('email', email)

      if (user !== null) {
        this.logger.error(`The user already exists at that email`)
        await this.exit()
      }

      const salt = randomBytes(32).toString('hex')
      const hasher = new PasswordHasher(password, salt)
      const hashedPassword = await hasher.hash()

      const res = await Database.transaction(async (trx) => {
        user = new User()
        user.useTransaction(trx)
        user.email = email
        user.salt = salt
        user.password = hashedPassword
        user.firstName = firstName
        user.lastName = lastName
        user.status = 'active'
        await user.save()

        if (!user.$isPersisted) {
          return false
        }

        const setting = new NotificationSetting()
        setting.useTransaction(trx)
        setting.userId = user.id
        await setting.save()

        if (!setting.$isPersisted) {
          return false
        }

        const role = new Role()
        role.useTransaction(trx)
        role.userId = user.id
        role.companyId = companyId
        // @ts-ignore
        role.role = inputRole
        await role.save()

        if (!role.$isPersisted) {
          return false
        }

        return user.id
      })

      if (!res) {
        this.logger.error('Failed to create account user')
        await this.exit()
      }

      this.logger.success(`New Account User was created. User ID: ${res}`)
    } catch (err) {
    } finally {
      await this.exit()
    }
  }
}
