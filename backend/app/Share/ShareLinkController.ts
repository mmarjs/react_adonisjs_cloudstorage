import { DateTime } from 'luxon'
import { isEmpty, toInteger } from 'lodash'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { CreateShareLinkValidator, UpdateShareLinkValidator } from 'App/Share/Validators'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ShareLink from 'App/Models/ShareLink'
import User from 'App/Models/User'
import Case from 'App/Models/Case'
import Database from '@ioc:Adonis/Lucid/Database'
import FetchShareLinks from 'App/Share/FetchShareLinks'
import CreateShareLink from 'App/Share/CreateShareLink'
import UpdateShareLink from 'App/Share/UpdateShareLink'
import EventDispatcher from 'App/Event/EventDispatcher'
import {
  CreateShareLinkBody,
  ShareUpdateBody,
  WorkGroupFileItem,
  PersonalFileItem,
} from 'App/types'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'

export default class ShareLinkController {
  public async fetch({ request, response }: HttpContextContract) {
    const { user_id: userId, case_id: caseId } = request.all()

    if (isEmpty(userId) || isEmpty(caseId)) {
      return response.unprocessableEntity({ error: 'params-not-present' })
    }

    const caseInstance = await Case.query()
      .select('id', 'company_id')
      .where('id', caseId)
      .firstOrFail()

    const fetchShareLinks = new FetchShareLinks(
      toInteger(userId),
      caseInstance.companyId,
      caseInstance.id
    )
    const links = await fetchShareLinks.fetch()

    return response.ok(links)
  }

  public async getData({ request, response }: HttpContextContract) {
    const link = request.param('link') as string

    if (typeof link !== 'string') {
      return response.badRequest({ error: 'Invalid link' })
    }

    const shareLink = await ShareLink.query().where('link', link).first()

    if (shareLink === null) {
      return response.badRequest({ error: 'Invalid share link' })
    }

    let files: WorkGroupFileItem[] | PersonalFileItem[] = []

    if (shareLink.shareType === 'download') {
      files = await ShareLink.downloadFiles(shareLink)
    }

    return response.ok({
      files: files,
    })
  }

  public async create({ request, response }: HttpContextContract) {
    await request.validate(CreateShareLinkValidator)

    try {
      const { userId, companyId } = await getCompanyUserIdsByToken(request.header('token'))
      const body = request.all() as CreateShareLinkBody

      if (await ShareLink.exists(body.identifier)) {
        return response.unprocessableEntity({ error: 'share-link-already-exists' })
      }

      const createShareLink = new CreateShareLink(userId, companyId, body)
      const link = await createShareLink.create()

      return response.ok(link)
    } catch (err) {
      if (err?.name === 'ER_DUP_ENTRY') {
        return response.unprocessableEntity({ error: 'duplicate-entry' })
      }

      return response.badRequest({ error: 'failed-to-create' })
    }
  }

  public async status({ request, response }: HttpContextContract) {
    const link = request.param('link') as string

    const shareLink = await ShareLink.findBy('link', link)

    if (shareLink === null) {
      return response.unprocessableEntity({ error: 'no-share-link-exists' })
    }

    const expiration = shareLink.expiresAt

    if (expiration !== null) {
      const now = DateTime.utc()

      if (now > expiration) {
        return response.badRequest({ error: 'link-is-expired' })
      }
    }

    // @ts-ignore
    if (shareLink.shareType === 'share') {
      return response.badRequest({ error: 'share-type-not-supported' })
    }

    const visits = shareLink.visits
    shareLink.visits = shareLink.visits + 1
    await shareLink.save()

    if (visits === 0) {
      if (shareLink.resource === 'work_group') {
        const folder = await WorkGroupFolder.query()
          .select('case_id')
          .where({ id: shareLink.folderId })
          .first()

        await EventDispatcher.dispatch({
          userId: shareLink.grantedById,
          companyId: shareLink.companyId,
          name: 'share-link-clicked',
          resource: 'case',
          resourceId: folder?.caseId,
          data: {
            shareLinkId: shareLink.id,
          },
        })
      }
    }

    const grantor = await User.findOrFail(shareLink.grantedById)
    await shareLink.load('company')
    const company = shareLink.company

    const { firstName } = shareLink
    const hasLoggedInBefore = firstName !== null

    const data = {
      grantor: `${grantor.firstName} ${grantor.lastName}`,
      company: company.name,
      expiration: expiration,
      hasLoggedInBefore: hasLoggedInBefore,
    }

    return response.ok(data)
  }

  public async update({ request, response }: HttpContextContract) {
    await request.validate(UpdateShareLinkValidator)
    const body = request.all() as ShareUpdateBody
    const id = request.param('id') as number

    const updateShareLink = new UpdateShareLink(id, body)
    const { error } = await updateShareLink.update()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.status(204)
  }

  public async delete({ request, response }: HttpContextContract) {
    await Database.transaction(async (trx) => {
      const id = request.param('id') as number

      const link = await ShareLink.findOrFail(id)
      link.useTransaction(trx)
      link.deletedAt = DateTime.local()
      await link.save()

      if (!link.$isPersisted) {
        return response.badRequest({ error: 'Failed to delete share item' })
      }
    })

    response.status(204)
  }
}
