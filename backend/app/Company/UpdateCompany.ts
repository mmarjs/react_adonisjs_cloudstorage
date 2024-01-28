import Company from 'App/Models/Company'
import { UpdateCompanyBody } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UpdateCompany {
  public companyId: number
  public data: UpdateCompanyBody
  constructor(companyId: number, data: UpdateCompanyBody) {
    this.companyId = companyId
    this.data = data
  }

  public async update(): Promise<Company> {
    const company = await Company.findOrFail(this.companyId)

    return await Database.transaction(async (trx) => {
      company.useTransaction(trx)

      if (this.data?.name) {
        company.name = this.data.name
      }

      if (this.data?.isTwoFactorRequired !== undefined) {
        company.isTwoFactorRequired = this.data?.isTwoFactorRequired
      }

      await company.save()

      return company
    })
  }
}
