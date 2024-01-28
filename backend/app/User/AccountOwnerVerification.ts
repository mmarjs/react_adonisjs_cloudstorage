import User from 'App/Models/User'
import { Either } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import JobDispatcher from 'App/Jobs/JobDispatcher'

export default class AccountOwnerVerification {
  private token: string
  private user: User

  constructor(token: string) {
    this.token = token
  }

  public async verify(): Promise<Either<boolean>> {
    const user = await User.findBy('verification_token', this.token)
    if (user === null) {
      return { error: 'no-such-user' }
    }

    if (user.verified) {
      return { error: 'already-verified' }
    }

    if (user.status === 'active') {
      return { error: 'already-active' }
    }

    this.user = user

    const res = await this.verifyOwner()

    if (!res) {
      return { error: 'could-not-verify-account-owner' }
    }

    await JobDispatcher.dispatch(user.id, null, 'send-slack', {
      message: `*Description*: Account Owner ${this.user.signature} has verified their account`,
    })

    return { error: null, success: res }
  }

  private async verifyOwner(): Promise<boolean> {
    const user = this.user

    return await Database.transaction(async (trx) => {
      user.useTransaction(trx)
      user.verified = true
      user.status = 'active'
      user.verificationToken = null
      await user.save()

      return user.$isPersisted
    })
  }
}
