import { randomBytes } from 'crypto'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class CreateAdmin extends BaseCommand {
  public static commandName = 'admin:create'
  public static description = 'Create an admin'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Admin } = await import('App/Models/Admin')
    const { default: PasswordHasher } = await import('App/Auth/PasswordHasher')

    const email = (await this.prompt.ask('Enter your admin email address')).trim()
    const password = (await this.prompt.ask('Enter your password')).trim()
    const firstName = (await this.prompt.ask('Enter your first name')).trim()
    const lastName = (await this.prompt.ask('Enter your last name')).trim()

    const salt = randomBytes(32).toString('hex')
    const passwordHasher = new PasswordHasher(password, salt)
    const hashedPassword = await passwordHasher.hash()

    const admin = new Admin()
    admin.email = email
    admin.salt = salt
    admin.password = hashedPassword
    admin.firstName = firstName
    admin.lastName = lastName

    await admin
      .save()
      .then(() => {
        this.logger.info(`Admin ID: ${admin.id}`)
      })
      .catch((err) => {
        this.logger.error(`${err?.message}`)
      })
  }
}
