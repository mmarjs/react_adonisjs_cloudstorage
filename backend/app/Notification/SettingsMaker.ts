import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import NotificationSetting from 'App/Models/NotificationSetting'
import NotificationMap from 'App/Notification/NotificationMap'
import { EventName, AccountRole } from 'App/types'

export default class SettingsMaker {
  public userId: number
  public companyId: number
  public role: AccountRole

  constructor(userId: number, companyId: number, role: AccountRole) {
    this.userId = userId
    this.companyId = companyId
    this.role = role
  }

  public async make(trx?: TransactionClientContract) {
    const events = await this.getEvents()

    for (let event of events) {
      const setting = new NotificationSetting()
      if (trx) {
        setting.useTransaction(trx)
      }
      setting.userId = this.userId
      setting.companyId = this.companyId
      setting.event = event
      setting.sendApp = true
      setting.sendEmail = false
      await setting.save()

      if (!setting.$isPersisted) {
        await trx?.rollback()
        return false
      }
    }

    return true
  }

  public async getEvents(): Promise<EventName[]> {
    const map = new NotificationMap('account-registered')

    if (this.role === 'account-owner') {
      return map.accountOwner()
    }

    if (this.role === 'account-admin') {
      return map.accountAdmin()
    }

    if (this.role === 'case-manager') {
      return map.caseManager()
    }

    if (this.role === 'client-user') {
      return map.clientUser()
    }

    return []
  }
}
