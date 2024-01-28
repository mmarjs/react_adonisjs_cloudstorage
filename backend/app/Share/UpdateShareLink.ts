import Log from 'App/Lib/Log'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Email from 'App/Mail/Email'
import Company from 'App/Models/Company'
import ShareLink from 'App/Models/ShareLink'
import Database from '@ioc:Adonis/Lucid/Database'
import PasswordHasher from 'App/Auth/PasswordHasher'
import ShareEmail from 'App/Mail/Emails/ShareInvitationEmail'
import { Either, ShareUpdateBody } from 'App/types'

export default class UpdateShareLink {
  public id: number
  public body: ShareUpdateBody

  constructor(id: number, body: ShareUpdateBody) {
    this.id = id
    this.body = body
  }

  public async update(): Promise<Either<boolean>> {
    const shareLink = await ShareLink.find(this.id)

    if (shareLink === null) {
      return { error: 'invalid-share-link' }
    }

    const res = await this.performUpdate(shareLink)

    if (!res) {
      return { error: 'failed-to-update-share-link' }
    }

    if (this.body?.resend) {
      await this.notify(shareLink)
    }

    return { error: null, success: true }
  }

  private async performUpdate(shareLink: ShareLink) {
    return await Database.transaction(async (trx) => {
      shareLink.useTransaction(trx)

      if (this.body?.expiry) {
        shareLink.expiresAt = DateTime.fromISO(this.body.expiry)
      }

      if (this.body?.password) {
        const hasher = new PasswordHasher(this.body.password, shareLink.salt)
        const hashedPassword = await hasher.hash()

        shareLink.password = hashedPassword
      }

      await shareLink.save()

      return shareLink.$isPersisted
    })
  }

  private async notify(link: ShareLink) {
    try {
      const grantor = await User.find(link.grantedById)

      if (grantor === null) {
        Log(new Error('grantor-does-not-exist'))
        return
      }

      const company = await Company.find(link.companyId)

      if (company === null) {
        Log(new Error('company-does-not-exist'))
        return
      }

      const email = link.email
      const subject = link.subject
      const msg = link.message
      const name = grantor.fullName
      const companyName = company.name

      const html = ShareEmail.html(
        name,
        email,
        companyName,
        this.body.password as string,
        link.link,
        msg
      )

      const mail = new Email(email, subject, html)
      await mail.send()

      return { error: null, success: true }
    } catch (err) {
      Log(err)

      return { error: null, success: true }
    }
  }
}
