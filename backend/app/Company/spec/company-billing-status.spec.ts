import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import CompanyBillingStatus from 'App/Company/CompanyBillingStatus'
import { CompanyFactory, EnterpriseFactory, EnterpriseSubscriberFactory } from 'Database/factories'

test.group('Company Billing Status', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('enterpriseStatus returns active', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const user = company.user
    await EnterpriseFactory.merge({ userId: user.id }).apply('active').create()

    const companyBillingStatus = new CompanyBillingStatus(company)
    const result = await companyBillingStatus.enterpriseStatus()

    assert.equal(result, 'active')
  })

  test('enterpriseSubscriberStatus returns active', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const user = company.user

    const enterprise = await EnterpriseFactory.merge({ userId: user.id }).apply('active').create()
    await EnterpriseSubscriberFactory.merge({
      enterpriseId: enterprise.id,
      companyId: company.id,
    }).create()

    const companyBillingStatus = new CompanyBillingStatus(company)
    const result = await companyBillingStatus.enterpriseSubscriberStatus()

    assert.equal(result, 'active')
  })

  test('directPayerStatus returns active', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()

    const companyBillingStatus = new CompanyBillingStatus(company)
    const result = await companyBillingStatus.directPayerStatus()

    assert.equal(result, 'active')
  })

  test('getStatus returns active', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()

    const user = company.user
    await EnterpriseFactory.merge({ userId: user.id }).apply('active').create()

    const companyBillingStatus = new CompanyBillingStatus(company)
    const result = await companyBillingStatus.getStatus()

    assert.equal(result, 'active')
  })

  test('getStatus returns unactivated', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    await EnterpriseFactory.merge({ userId: user.id }).create()

    const companyBillingStatus = new CompanyBillingStatus(company)
    const result = await companyBillingStatus.getStatus()

    assert.equal(result, 'unactivated')
  })
})
