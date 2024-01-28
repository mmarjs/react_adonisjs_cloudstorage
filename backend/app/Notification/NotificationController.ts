import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'

export default class NotificationController {
  /** GET /notifications */
  public async index({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const notifications = await Notification.userNotifications(userId, companyId, [
      'id',
      'event',
      'message',
      'created_at',
    ])

    return response.ok(notifications)
  }

  /** GET /notifications/count */
  public async count({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const count = await Notification.notificationCount(userId, companyId)

    return response.ok({ count })
  }

  /** PUT /notifications/:id/dismiss */
  public async dismiss({ request, response, token }: HttpContextContract) {
    const id = Number(request.param('id'))
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const notification = await Notification.query()
      .select('id')
      .where({ id })
      .where({ userId })
      .where({ companyId })
      .reporterData({ name: 'get-notification-to-dismiss' })
      .first()

    if (notification === null) {
      return response.badRequest({ error: 'no-notification-found' })
    }

    notification.dismissedAt = DateTime.local()
    await notification.save()

    if (!notification.$isPersisted) {
      return response.badRequest({ error: 'failed-to-dismiss-notification' })
    }

    return response.ok({ status: 'ok' })
  }

  /** /notifications/dismiss_all */
  public async dismissAll({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const undismissedCount = await Notification.query()
      .count('id as total')
      .where({ userId })
      .where({ companyId })
      .whereNull('dismissed_at')
      .pojo<{ total: number }>()
      .reporterData({ name: 'get-undismissed-notification-count' })
      .firstOrFail()

    if (undismissedCount.total === 0) {
      return response.ok({ status: 'ok' })
    }

    const res = await Database.transaction(async (trx) => {
      const result = await Notification.query({ client: trx })
        .where({ userId })
        .where({ companyId })
        .whereNull('dismissed_at')
        .reporterData({ name: 'dismiss-all-notifications' })
        .update({ dismissedAt: DateTime.local().toISO() })
        .limit(undismissedCount.total)

      return result[0] as number
    })

    if (res !== undismissedCount.total) {
      return response.badRequest({ error: 'failed-to-dismiss-all-notifications' })
    }

    return response.ok({ status: 'ok' })
  }
}
