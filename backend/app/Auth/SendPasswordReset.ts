import cuid from 'cuid'
import User from 'App/Models/User'
import Email from 'App/Mail/Email'
import JobDispatcher from 'App/Jobs/JobDispatcher'
import PasswordReset from 'App/Models/PasswordReset'
import PasswordResetEmail from 'App/Mail/Emails/PasswordResetEmail'
import { Either } from 'App/types'

export default async function sendPasswordReset(email: string): Promise<Either<true>> {
  const user = await User.findBy('email', email)

  if (user === null) {
    return { error: 'invalid-user' }
  }

  const reset = new PasswordReset()
  reset.userId = user.id
  reset.token = cuid()
  reset.used = false
  await reset.save()

  if (!reset.$isPersisted) {
    return { error: 'failed-to-create-password-reset' }
  }

  const html = PasswordResetEmail.html(user.firstName, reset.token)
  const mail = new Email(email, 'Reset your password for Evidence Locker', html)
  await mail.send()

  const slackMessage = `*Description*: ${user.signature} requested a password reset email`
  await JobDispatcher.dispatch(user.id, null, 'send-slack', { message: slackMessage })

  return { error: null, success: true }
}
