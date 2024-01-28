import User from 'App/Models/User'
import UserInvitation from 'App/Models/UserInvitation'
import { Either } from 'App/types'
import { DateTime } from 'luxon'
import Role from 'App/Models/Role'
import PersonalFolder from 'App/Models/PersonalFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import PasswordHasher from 'App/Auth/PasswordHasher'
import EventDispatcher from 'App/Event/EventDispatcher'

export default class UserVerification {
  private code: string
  private password: string
  private user: User
  private invitation: UserInvitation

  constructor(code: string, password: string) {
    this.code = code
    this.password = password
  }

  public async verify(): Promise<Either<boolean>> {
    const invitation = await UserInvitation.findBy('code', this.code)

    if (invitation === null) {
      return { error: 'invitation-does-not-exist' }
    }

    if (invitation.expiresAt !== null) {
      const today = DateTime.utc()

      if (invitation.expiresAt < today) {
        return { error: 'invitation-is-expired' }
      }
    }

    if (invitation.status === 'accepted') {
      return { error: 'invitation-already-accepted' }
    }

    this.invitation = invitation

    const user = await User.find(invitation.userId)

    if (user === null) {
      return { error: 'user-does-not-exist' }
    }

    this.user = user

    const res = await this.activateUser()

    if (!res) {
      return { error: 'could-not-activate-user' }
    }

    await EventDispatcher.dispatch({
      userId: user.id,
      companyId: invitation.companyId,
      name: 'user-verified-account',
      resource: 'user',
      resourceId: invitation.userId,
    })

    return { error: null, success: res }
  }

  private async activateUser() {
    const user = this.user
    const invitation = this.invitation

    const salt = user.salt
    const hasher = new PasswordHasher(this.password, salt)
    const hashedPassword = await hasher.hash()

    return await Database.transaction(async (trx) => {
      invitation.useTransaction(trx)
      invitation.status = 'accepted'
      await invitation.save()

      const role = await Role.findByOrFail('user_id', invitation.userId)

      user.useTransaction(trx)
      user.status = 'active'
      user.verified = true
      user.verificationToken = null
      user.password = hashedPassword
      await user.save()

      const folder = new PersonalFolder()
      folder.useTransaction(trx)
      folder.name = 'Personal'
      folder.userId = invitation.userId
      folder.companyId = role.companyId
      folder.status = 'active'
      folder.access = 'private'
      await folder.save()

      return invitation.$isPersisted
    })
  }
}
