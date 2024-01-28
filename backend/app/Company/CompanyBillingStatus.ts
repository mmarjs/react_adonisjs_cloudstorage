import Log from 'App/Lib/Log'
import Company from 'App/Models/Company'
import EnterpriseSubscriber from 'App/Models/EnterpriseSubscriber'

export default class CompanyBillingStatus {
  public company: Company

  constructor(company: Company) {
    this.company = company
  }

  public async getStatus(): Promise<string> {
    try {
      if (this.company.isEnterprise) {
        return await this.enterpriseStatus()
      } else {
        if (this.company.isEnterpriseSubscriber) {
          return this.enterpriseSubscriberStatus()
        } else {
          return this.directPayerStatus()
        }
      }
    } catch (err) {
      Log(err, 'Billing status lookup failed')
      return err.message
    }
  }

  public async enterpriseStatus() {
    await this.company.load('user')
    const user = this.company.user

    await user.load('enterprise')
    const enterprise = user.enterprise

    if (enterprise === null || undefined) {
      return 'unactivated'
    }

    return enterprise.billingStatus
  }

  public async enterpriseSubscriberStatus() {
    const enterpriseSubscriber = await EnterpriseSubscriber.findBy('company_id', this.company.id)

    if (enterpriseSubscriber === null) {
      return 'unactivated'
    }

    await enterpriseSubscriber?.load('enterprise')
    const enterprise = enterpriseSubscriber?.enterprise

    return enterprise?.billingStatus
  }

  public async directPayerStatus() {
    return this.company.billingStatus
  }
}
