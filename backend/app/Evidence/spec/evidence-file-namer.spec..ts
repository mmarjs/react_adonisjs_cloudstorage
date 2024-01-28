import test from 'japa'
import cuid from 'cuid'
import {
  CompanyFactory,
  CaseFactory,
  CustodianFactory,
  AcquisitionFactory,
} from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'
import Service from 'App/Models/Service'
import ServiceItem from 'App/Models/ServiceItem'
import EvidenceFileNamer from 'App/Evidence/EvidenceFileNamer'

test.group('Evidence File Namer', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('generated filename for Uber returns expected filename', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.with('caseType', 1)
      .with('timeZone', 1)
      .merge({ companyId: company.id })
      .create()

    const custodian = await CustodianFactory.merge({ caseId: caseInstance.id }).create()
    const service = await Service.query().where('name', 'Uber').firstOrFail()

    const serviceItem = await ServiceItem.query().where('name', 'Uber Trip History').firstOrFail()
    const acquisition = await AcquisitionFactory.merge({ custodianId: custodian.id })
      .apply('in_progress')
      .create()

    const nonce = cuid.slug()
    const taxon = 'history-item'
    const fileEnding = `${cuid()}.json`

    const evidenceFileNamer = new EvidenceFileNamer(
      acquisition,
      service.name,
      serviceItem.name,
      nonce,
      fileEnding
    )
    const path = await evidenceFileNamer.getPath()
    const expectedPath = `company-${company.id}/case-${caseInstance.id}/custodian-${custodian.id}/acquisition-${acquisition.id}/service-${service.name}/service-item-${serviceItem.name}/nonce-${nonce}/${taxon}-${fileEnding}`

    assert.equal(path, expectedPath)
  })

  test('generated filename for taxon not in taxonomy returns file ending with item', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.with('caseType', 1)
      .with('timeZone', 1)
      .merge({ companyId: company.id })
      .create()

    const custodian = await CustodianFactory.merge({ caseId: caseInstance.id }).create()
    const service = await Service.query().where('name', 'Google').firstOrFail()

    const serviceItem = await ServiceItem.query().where('name', 'Gmail Messages').firstOrFail()
    const acquisition = await AcquisitionFactory.merge({ custodianId: custodian.id })
      .apply('in_progress')
      .create()

    const nonce = cuid.slug()
    const taxon = 'item'
    const fileEnding = `${cuid()}.json`

    const evidenceFileNamer = new EvidenceFileNamer(
      acquisition,
      service.name,
      serviceItem.name,
      nonce,
      fileEnding
    )

    const path = await evidenceFileNamer.getPath()
    const expectedPath = `company-${company.id}/case-${caseInstance.id}/custodian-${custodian.id}/acquisition-${acquisition.id}/service-${service.name}/service-item-${serviceItem.name}/nonce-${nonce}/${taxon}-${fileEnding}`

    assert.equal(path, expectedPath)
  })
})
