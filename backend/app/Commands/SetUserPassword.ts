import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class SetUserPassword extends BaseCommand {
  public static commandName = 'user:set_password'

  public static description = 'Set User Password'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: User } = await import('App/Models/User')
    const { default: PasswordHasher } = await import('App/Auth/PasswordHasher')

    const userId = Number(await this.prompt.ask('The User ID'))

    const user = await User.find(userId)

    if (user === null) {
      this.logger.error('No such user')
      await this.exit()
      return
    }

    const password = await this.prompt.secure(`Please enter the password.`)
    const confirmation = await this.prompt.secure('Please confirm the password.')

    if (password.length < 8) {
      this.logger.error('A password must contain at least 8 characters.')
      await this.exit()
    }

    if (password !== confirmation) {
      this.logger.error('The passwords do not match. Please try again.')
      await this.exit()
    }

    const choice = await this.prompt.confirm(
      `Do you want to set the password for ${user?.fullName} at ${user?.email}`
    )

    if (!choice) {
      this.logger.error('Aborting password reset')
      await this.exit()
    }

    const hasher = new PasswordHasher(password, user.salt)
    const hashedPassword = await hasher.hash()

    user.password = hashedPassword
    await user.save()

    if (!user.$isPersisted) {
      this.logger.error('Failed to set new password')
    } else {
      this.logger.success(`Succesfully set new password`)
    }
  }
}
