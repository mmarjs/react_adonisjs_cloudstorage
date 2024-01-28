import User from 'App/Models/User'
import { UpdateUserProfile, Either } from 'App/types'
import PasswordHasher from 'App/Auth/PasswordHasher'

export default class ProfileUpdater {
  private userId: number
  private body: UpdateUserProfile
  private user: User

  constructor(userId: number, body: UpdateUserProfile) {
    this.userId = userId
    this.body = body
  }

  public async update(): Promise<Either<User>> {
    const user = await User.find(this.userId)

    if (user === null) {
      return { error: 'user-does-not-exist' }
    }

    this.user = user

    if (!(await this.email())) {
      return { error: 'cannot-update-email' }
    }

    await this.password()
    this.simple()

    await this.user.save()

    if (!this.user.$isPersisted) {
      return { error: 'cannot-update-user' }
    }

    return { error: null, success: this.user }
  }

  private async email(): Promise<boolean> {
    if (this.body.email) {
      const nextEmail = this.body?.email?.toLowerCase().trim() as string
      const emailTest = await User.query().select('email').where('email', nextEmail).first()

      if (emailTest !== null) {
        return false
      }

      this.user.email = nextEmail

      return true
    } else {
      return true
    }
  }

  private async password() {
    const { password } = this.body

    if (password) {
      const hasher = new PasswordHasher(password, this.user.salt)
      const nextPassword = await hasher.hash()

      this.user.password = nextPassword
    }

    return this
  }

  private simple() {
    const {
      phone,
      firstName,
      lastName,
      street,
      city,
      state,
      zip,
      companyName,
      isTwoFactorRequired,
      twoFactorMethod,
    } = this.body

    if (firstName) {
      this.user.firstName = firstName
    }

    if (lastName) {
      this.user.lastName = lastName
    }

    if (phone) {
      this.user.phone = phone
    }

    if (street) {
      this.user.street = street
    }

    if (city) {
      this.user.city = city
    }

    if (state) {
      this.user.state = state
    }

    if (zip) {
      this.user.zip = zip
    }

    if (companyName) {
      this.user.companyName = companyName
    }

    if (isTwoFactorRequired !== undefined) {
      this.user.isTwoFactorRequired = isTwoFactorRequired
    }

    if (twoFactorMethod) {
      this.user.twoFactorMethod = twoFactorMethod
    }
  }
}
