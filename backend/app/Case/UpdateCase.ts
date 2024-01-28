import Case from 'App/Models/Case'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import { UpdateCaseParams } from 'App/types'

export default class UpdateCase {
  public caseId: number
  public params: UpdateCaseParams

  constructor(caseId: number, params: UpdateCaseParams) {
    this.caseId = caseId
    this.params = params
  }

  public async update(): Promise<boolean> {
    return await Database.transaction(async (trx) => {
      const c = await Case.find(this.caseId)

      if (c === null) {
        return false
      }

      c.useTransaction(trx)
      c.caseTypeId = this.params.caseTypeId
      c.timeZoneId = this.params.timeZoneId
      c.caseName = this.params.caseName
      c.clientName = this.params.clientName

      if (this.params?.clientReference) {
        c.clientReference = this.params.clientReference
      }

      if (this.params?.clientEmail) {
        c.clientEmail = this.params.clientEmail
      }

      if (this.params?.clientPhone) {
        c.clientPhone = this.params.clientPhone
      }

      if (this.params?.notes) {
        c.notes = this.params.notes
      }

      if (this.params?.status) {
        if (this.params.status === 'active') {
          c.status = 'active'
        }

        if (this.params.status === 'archive') {
          c.status = 'archived'
        }

        if (this.params.status === 'delete') {
          c.status = 'deleted'
          c.deletedAt = DateTime.local()
        }
      }

      await c.save()

      return c.$isPersisted
    })
  }
}
