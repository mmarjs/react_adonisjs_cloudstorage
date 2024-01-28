import Log from 'App/Lib/Log'
import { isValidOtp } from 'App/Auth/TwoFactor'
import ValidateLogin from 'App/Auth/ValidateLogin'
import { isTwoFactorRequired } from 'App/Auth/TwoFactor'
import LoginData from 'App/Auth/LoginData'
import Auth from 'App/Auth/Auth'
import Company from 'App/Models/Company'
import { LoginInput, Either } from 'App/types'

export default async function handleLogin(params: LoginInput): Promise<Either<any>> {
  try {
    const { email, password, action, userId, companyId, loginProcessToken, twoFactorToken } = params

    if (action === 'validate-login') {
      const validate = new ValidateLogin(email, password)
      const res = await validate.validate()

      if (res.success) {
        return { error: null, success: res?.message }
      } else {
        return { error: res?.message?.error as string }
      }
    }

    if (action === 'need-two-factor') {
      const auth = new Auth()
      const validProcess = await auth.isValidLoginProcessToken(loginProcessToken)

      if (!validProcess) {
        return { error: 'invalid-login-process-token' }
      }

      if (await Company.isDeleted(companyId)) {
        return { error: 'company-is-deleted' }
      }

      const isRequired = await isTwoFactorRequired(userId, companyId)

      return { error: null, success: { status: isRequired } }
    }

    if (action === 'verify-two-factor') {
      const auth = new Auth()
      const validProcess = await auth.isValidLoginProcessToken(loginProcessToken)

      if (!validProcess) {
        return { error: 'invalid-login-process-token' }
      }

      const isVerified = await isValidOtp(twoFactorToken)

      if (!isVerified) {
        return { error: 'invalid-two-factor' }
      }

      return { error: null, success: { status: 'two-factor-verified' } }
    }

    if (action === 'fetch-login-data') {
      const auth = new Auth()
      const validProcess = await auth.isValidLoginProcessToken(loginProcessToken)

      if (!validProcess) {
        return { error: 'invalid-login-process-token' }
      }

      const company = await Company.findOrFail(companyId)
      const loginData = new LoginData(userId, company)
      const data = await loginData.prepare()

      await auth.deleteLoginProcessToken(loginProcessToken)

      return { error: null, success: data }
    }

    return { error: 'failed-to-login' }
  } catch (err) {
    Log(err)
    return { error: 'failed-to-login' }
  }
}
