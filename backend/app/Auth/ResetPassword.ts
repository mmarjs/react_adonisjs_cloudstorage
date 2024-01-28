import { DateTime } from 'luxon'
import { ResetPasswordBody, Either } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import PasswordReset from 'App/Models/PasswordReset'
import PasswordHasher from 'App/Auth/PasswordHasher'

export default async function resetPassword(body: ResetPasswordBody): Promise<Either<'ok'>> {
  const { token, password } = body

  try {
    const reset = await PasswordReset.query().where('token', token).preload('user').first()

    if (reset === null) {
      return { error: 'no-password-reset' }
    }

    if (reset.used) {
      return { error: 'invalid-token' }
    }

    const user = reset.user

    if (user === null) {
      return { error: 'user-is-null' }
    }

    const now = DateTime.local()
    const diff = reset.createdAt.diff(now, 'minutes').toObject()

    if (!diff.minutes) {
      return { error: 'expired-token' }
    }

    /**
     * The following tests if the diff is greater than the 20 minute limit,
     * however because we are dealing with negative numbers, we have use the
     * < for comparison.
     */

    if (diff.minutes < -20) {
      return { error: 'expired-token' }
    }

    const isReset = await Database.transaction(async (trx) => {
      reset.useTransaction(trx)

      const hasher = new PasswordHasher(password, user.salt)
      const hashedPassword = await hasher.hash()

      user.useTransaction(trx)
      user.password = hashedPassword
      await user.save()

      reset.used = true
      await reset.save()

      return reset.$isPersisted
    })

    if (!isReset) {
      return { error: 'could-not-reset-password' }
    }

    return { error: null, success: 'ok' }
  } catch (err) {
    console.dir(err)
    return { error: 'failed-to-reset-password' }
  }
}
