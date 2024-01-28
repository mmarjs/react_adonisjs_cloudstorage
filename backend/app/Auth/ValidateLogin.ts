import User from 'App/Models/User'
import Auth from 'App/Auth/Auth'
import Role from 'App/Models/Role'
import Company from 'App/Models/Company'
import Email from 'App/Mail/Email'
import PasswordHasher from 'App/Auth/PasswordHasher'
import { ValidateLoginResponse } from 'App/types'
import AccountVerificationEmail from 'App/Mail/Emails/AccountVerificationEmail'

export default class ValidateLogin {
  public email: string
  public password: string
  public user: User

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }

  public async validate(): Promise<ValidateLoginResponse> {
    const user = await User.query().where('email', this.email).whereNull('deleted_at').first()

    const isValidUser = this.validateUser(user)

    if (!isValidUser.success) {
      return this.format(false, isValidUser.message)
    }

    const isValidPassword = await this.validatePassword()

    if (!isValidPassword.success) {
      return this.format(false, isValidPassword.message)
    }

    const isAccountOwner = await this.isAccountOwner()

    if (isAccountOwner.success) {
      if (isAccountOwner.message?.error) {
        return this.format(false, isAccountOwner.message)
      }

      return this.format(true, isAccountOwner.message)
    }

    const roleCompany = await this.roleCompany()

    return this.format(roleCompany.success, roleCompany.message)
  }

  public validateUser(user: User | null): ValidateLoginResponse {
    if (user === null) {
      return this.format(false, { error: 'no-such-account' })
    }

    if (user.status !== 'active') {
      return this.format(false, { error: 'inactive-user' })
    }

    if (!user.verified) {
      const html = AccountVerificationEmail.html(user.firstName, user.verificationToken as string)
      const email = new Email(user.email, 'Verify your account', html)
      email.send().then(() => {})

      return this.format(false, { error: 'unverified-user' })
    }

    this.user = user

    return this.format(true)
  }

  public async validatePassword(): Promise<ValidateLoginResponse> {
    const hasher = new PasswordHasher(this.password, this.user.salt)
    const testHash = await hasher.hash()

    if (testHash !== this.user.password) {
      return this.format(false, { error: 'invalid-password' })
    }

    return { success: true }
  }

  public async isAccountOwner(): Promise<ValidateLoginResponse> {
    const user = this.user
    const ownsAccounts = await Company.ownsAnyAccounts(user.id)

    if (ownsAccounts) {
      const auth = new Auth()

      const loginProcessToken = await auth.makeLoginProcessToken(user.id)
      const company = await Company.query()
        .select('id', 'name')
        .where('user_id', user.id)
        .firstOrFail()

      if (await Company.isDeleted(company.id)) {
        return { success: true, message: { error: 'company-is-deleted' } }
      }

      return this.format(true, {
        action: 'need-two-factor',
        loginProcessToken,
        userId: user.id,
        companies: [{ id: company.id, name: company.name }],
      })
    }

    return { success: false }
  }

  public async roleCompany(): Promise<ValidateLoginResponse> {
    const user = this.user

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const companyIds = await Role.companies(user.id)

    if (companyIds.length === 0) {
      return this.format(false, { error: 'no-roles' })
    }

    const companies = await Company.query()
      .select('id', 'name')
      .whereIn('id', companyIds)
      .pojo<{ id: number; name: string }>()

    return this.format(true, {
      action: 'need-two-factor',
      loginProcessToken,
      userId: user.id,
      companies,
    })
  }

  public format(success: boolean, message?: object): ValidateLoginResponse {
    const res: ValidateLoginResponse = {
      success: success,
    }

    if (message) {
      res.message = message
    }

    return res
  }
}
