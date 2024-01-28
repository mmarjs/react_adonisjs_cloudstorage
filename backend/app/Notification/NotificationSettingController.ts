import NotificationSetting from 'App/Models/NotificationSetting'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { UpdateNotificationSettingValidator } from 'App/Notification/Validators'
import { UpdateSettingsParams } from 'App/types'

export default class NotificationSettingController {
  /** GET /notification_settings */
  public async index({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const settings = await NotificationSetting.query()
      .select('id', 'event', 'send_app', 'send_email')
      .where({ userId })
      .where({ companyId })

    if (settings.length === 0) {
      return response.badRequest({ error: 'invalid-settings' })
    }

    return response.ok(settings)
  }

  /** PUT /notification_settings/:id/update */
  public async update({ request, response, token }: HttpContextContract) {
    await request.validate(UpdateNotificationSettingValidator)
    const id = Number(request.param('id'))
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const { column, value } = request.all() as UpdateSettingsParams

    let setting = await NotificationSetting.query()
      .select('id', 'event', 'send_app', 'send_email')
      .where({ id })
      .where({ userId })
      .where({ companyId })
      .first()

    if (setting === null) {
      return response.badRequest({ error: 'no-setting-found' })
    }

    if (column === 'sendApp') {
      setting.sendApp = value
    }

    if (column === 'sendEmail') {
      setting.sendEmail = value
    }

    await setting.save()

    if (!setting.$isPersisted) {
      return response.badRequest({ error: 'failed-to-update-notification-setting' })
    }

    setting = await NotificationSetting.query()
      .select('id', 'event', 'send_app', 'send_email')
      .where({ id })
      .where({ userId })
      .where({ companyId })
      .firstOrFail()

    return response.ok(setting.serialize())
  }
}
