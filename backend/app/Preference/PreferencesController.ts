import Preference from 'App/Models/Preference'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { UpdatePreferenceValidator } from 'App/Preference/Validators'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PreferencesController {
  public async index({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const preferences = await Preference.query()
      .select('id', 'name', 'option')
      .where({ userId })
      .where({ companyId })
      .reporterData({ name: 'fetch-pref-in-preferences-index' })

    return response.ok(preferences)
  }

  public async update({ request, response, token }: HttpContextContract) {
    await request.validate(UpdatePreferenceValidator)
    const id = Number(request.param('id'))
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const { option } = request.all() as { option: boolean }

    const preference = await Preference.query()
      .where({ id: id })
      .where({ userId })
      .where({ companyId })
      .reporterData({ name: 'fetch-pref-in-preferences-update' })
      .first()

    if (preference === null) {
      return response.badRequest({ error: 'no-such-preference' })
    }

    preference.option = option
    await preference.save()

    if (!preference.$isPersisted) {
      return response.badRequest({ error: 'failed-to-update-option' })
    }

    return response.ok({ status: 'ok' })
  }
}
