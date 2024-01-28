import cuid from 'cuid'
import Log from 'App/Lib/Log'
import Auth from 'App/Auth/Auth'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import { ShareLoginInput, Either } from 'App/types'
import PasswordHasher from 'App/Auth/PasswordHasher'
import ShareLink from 'App/Models/ShareLink'
import Debug from 'debug'

interface Response {
  token: string
  shareLink: ShareLink
}

export default async function handleShareLogin(params: ShareLoginInput): Promise<Either<Response>> {
  const debug = Debug('share:login')

  const { email, password, link, firstName, lastName, phone, companyName } = params

  try {
    debug('fetch share link')
    const shareLink = await ShareLink.query()
      .select(
        'id',
        'company_id',
        'granted_by_id',
        'link',
        'first_name',
        'last_name',
        'resource',
        'resource_id',
        'folder_id',
        'can_update_password',
        'can_trash',
        'share_type',
        'expires_at',
        'deleted_at',
        'password',
        'salt'
      )
      .where('link', link)
      .where('email', email)
      .first()

    if (shareLink === null) {
      Log(new Error(`Share login failure. Share link ${link} is null`))

      return { error: 'no-such-account' }
    }

    if (shareLink.deletedAt !== null) {
      Log(new Error(`Share login failure. Share link ${link} is deleted`))

      return { error: 'share-link-deleted' }
    }

    if (shareLink.expiresAt !== null) {
      const today = DateTime.utc()

      if (shareLink.expiresAt < today) {
        Log(new Error(`Share link ${link} expired on ${shareLink.expiresAt.toISO()}`))

        return { error: 'share-link-expired' }
      }
    }

    // @ts-ignore
    if (shareLink.shareType === 'share') {
      return { error: 'share-type-not-supported' }
    }

    debug('compare password')
    const hasher = new PasswordHasher(password.trim(), shareLink.salt)
    const testHash = await hasher.hash()
    const storedPassword = shareLink.password

    if (testHash !== storedPassword) {
      Log(new Error(`Share login failure. Invalid password (${password}) for link ${link}`))

      return { error: 'invalid-password' }
    }

    debug('update info')
    await Database.transaction(async (trx) => {
      shareLink.useTransaction(trx)

      if (firstName) {
        shareLink.firstName = firstName
      }

      if (lastName) {
        shareLink.lastName = lastName
      }

      if (phone) {
        shareLink.phone = phone
      }

      if (companyName) {
        shareLink.companyName = companyName
      }

      shareLink.lastLogin = DateTime.local()
      await shareLink.save()
    })

    debug('store auth token')
    const token = cuid()
    const auth = new Auth(token)
    await auth.store(shareLink.grantedById, shareLink.companyId, shareLink.id)

    debug('return values')
    return { error: null, success: { token, shareLink } }
  } catch (err) {
    Log(err)

    return { error: 'failed-to-login' }
  }
}
