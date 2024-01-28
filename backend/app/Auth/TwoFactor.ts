import { totp } from 'otplib'
import Debug from 'debug'
import { randomBytes } from 'crypto'
import Env from '@ioc:Adonis/Core/Env'
import TwoFactorToken from 'App/Models/TwoFactorToken'
import Company from 'App/Models/Company'
import User from 'App/Models/User'
import Email from 'App/Mail/Email'
import TwoFactorEmail from 'App/Mail/Emails/TwoFactorEmail'

export async function dispatchTwoFactor(userId: number, method: string) {
  const secret = randomBytes(20).toString('hex')
  totp.options = { step: 30 }
  const token = totp.generate(secret)

  const twoFactorToken = await TwoFactorToken.create({
    userId: userId,
    method,
    secret,
    token,
  })

  if (Env.get('NODE_ENV') !== 'testing') {
    await twoFactorToken.load('user')
    const user = twoFactorToken.user

    const html = TwoFactorEmail.html(user.firstName, twoFactorToken.token)
    const email = new Email(user.email, 'Here is your one time pin for Evidence Locker', html)
    await email.send()
  }
}

export async function isValidOtp(token: string): Promise<boolean> {
  const twoFactorToken = await TwoFactorToken.findBy('token', token)

  if (twoFactorToken === null) {
    return false
  }

  /**
   * For more info see:
   * https://github.com/yeojz/otplib/blob/master/README.md#in-nodejs
   */
  totp.options = { step: 30, window: 10 }
  const isValid = totp.check(twoFactorToken.token, twoFactorToken.secret)

  if (!isValid) {
    return false
  }

  await twoFactorToken.delete()

  return true
}

export async function isTwoFactorRequired(userId: number, companyId: number): Promise<boolean> {
  const debug = Debug('login:2fa')
  const user = await User.query().select('id', 'is_two_factor_required').where('id', userId).first()
  debug(`user is ${user?.id}`)

  const company = await Company.query()
    .select('id', 'is_two_factor_required')
    .where('id', companyId)
    .first()

  debug(`company is ${company?.id}`)

  const res = Boolean(user?.isTwoFactorRequired) || Boolean(company?.isTwoFactorRequired)
  debug(`2FA Required?: $${res}`)

  if (res) {
    await dispatchTwoFactor(userId, 'email')
  }

  return res
}
