import { scrypt } from 'crypto'
import Env from '@ioc:Adonis/Core/Env'

export default class PasswordHasher {
  private pepper: string = Env.get('PASSWORD_PEPPER')
  private salt: string
  private password: string

  constructor(password: string, salt: string) {
    this.salt = salt
    this.password = password.normalize()
  }

  public async hash(): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltAndPepper = `${this.pepper}${this.salt}`

      scrypt(this.password, saltAndPepper, 64, (err, key) => {
        if (err) {
          reject(err)
        }

        resolve(key.toString('hex'))
      })
    })
  }
}
