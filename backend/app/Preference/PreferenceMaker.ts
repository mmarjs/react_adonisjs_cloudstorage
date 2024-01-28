import Preference from 'App/Models/Preference'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { PreferenceName } from 'App/types'

export default class PreferenceMaker {
  public userId: number
  public companyId: number

  constructor(userId: number, companyId: number) {
    this.userId = userId
    this.companyId = companyId
  }

  public async make(trx?: TransactionClientContract) {
    const names = this.names()

    for (let name of names) {
      const pref = new Preference()
      if (trx) {
        pref.useTransaction(trx)
      }
      pref.userId = this.userId
      pref.companyId = this.companyId
      pref.name = name
      pref.option = true
      await pref.save()

      if (!pref.$isPersisted) {
        await trx?.rollback()
        return false
      }
    }

    return true
  }

  protected names() {
    const names: PreferenceName[] = [
      'collapse-main-menu-bar',
      'hide-archived-cases',
      'show-case-card-view',
    ]

    return names
  }
}
