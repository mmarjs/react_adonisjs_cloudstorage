import { DateTime } from 'luxon'
import { randomBytes } from 'crypto'
import ShareLink from 'App/Models/ShareLink'
import { stripHtml } from 'string-strip-html'
import ShareResource from 'App/Models/ShareResource'
import PasswordHasher from 'App/Auth/PasswordHasher'
import Database from '@ioc:Adonis/Lucid/Database'
import JobDispatcher from 'App/Jobs/JobDispatcher'
import { CreateShareLinkBody } from 'App/types'

export default class CreateShareLink {
  public grantorId: number
  public companyId: number
  public body: CreateShareLinkBody

  constructor(grantorId: number, companyId: number, body: CreateShareLinkBody) {
    this.grantorId = grantorId
    this.companyId = companyId
    this.body = body
  }

  public async create() {
    const link = await this.store()

    if (link instanceof ShareLink) {
      await JobDispatcher.dispatch(this.grantorId, this.companyId, 'send-share-link', {
        user: { userId: this.grantorId, companyId: this.companyId },
        linkId: link.id,
        password: this.body.password,
      })
    }

    return link
  }

  private async store() {
    const salt = randomBytes(32).toString('hex')
    const passwordHasher = new PasswordHasher(this.body.password.trim(), salt)
    const hashedPassword = await passwordHasher.hash()

    const strippedSubject = stripHtml(this.body.subject ?? '')
    const strippedMessage = stripHtml(this.body.message ?? '')
    const resourceId = await ShareLink.getResourceId(
      this.body.resource,
      this.body.folderId,
      this.grantorId
    )

    return await Database.transaction(async (trx) => {
      const link = new ShareLink()
      link.useTransaction(trx)
      link.companyId = this.companyId
      link.grantedById = this.grantorId
      link.link = this.body.identifier
      link.email = this.body.email
      link.salt = salt
      link.password = hashedPassword
      link.resource = this.body.resource
      link.resourceId = resourceId
      link.folderId = this.body.folderId
      link.subject = strippedSubject.result
      link.shareType = this.body.shareType

      if (this.body.message !== undefined) {
        link.message = strippedMessage.result
      }

      if (this.body.expiresAt !== undefined) {
        link.expiresAt = DateTime.fromISO(this.body.expiresAt)
      }

      if (this.body.canUpdatePassword !== undefined) {
        link.canUpdatePassword = this.body.canUpdatePassword
      }

      if (this.body.canTrash !== undefined) {
        link.canTrash = this.body.canTrash
      }

      await link.save()

      for (let item of this.body.items) {
        /** Only download shareType need ShareResource */
        if (link.shareType === 'download') {
          const shareResource = new ShareResource()
          shareResource.useTransaction(trx)
          shareResource.shareLinkId = link.id
          shareResource.resource = item.resource
          shareResource.resourceId = item.resourceId
          await shareResource.save()
        }
      }

      return link
    })
  }
}
