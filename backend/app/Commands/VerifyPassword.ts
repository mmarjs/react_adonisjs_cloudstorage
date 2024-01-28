import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class VerifyPassword extends BaseCommand {
  public static commandName = 'password:verify'
  public static description = 'Validate password against salt and hash'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: PasswordHasher } = await import('App/Auth/PasswordHasher')

    const plaintext = (await this.prompt.ask('Enter plaintext password')).trim()
    const salt = (await this.prompt.ask('Enter salt')).trim()
    const givenHash = (await this.prompt.ask('Enter hashed password')).trim()

    const hasher = new PasswordHasher(plaintext, salt)
    const calculatedHash = await hasher.hash()

    if (calculatedHash !== givenHash) {
      this.logger.error(`Password does not match.`)
      this.logger.debug(`Given Hash: ${givenHash}`)
      this.logger.debug(` Calculated Hash ${calculatedHash}`)
      await this.exit()
    }

    this.logger.success(`Password, salt, and hash are correct.`)
    this.logger.debug(`Given Hash: ${givenHash}`)
    this.logger.debug(` Calculated Hash ${calculatedHash}`)
  }
}
