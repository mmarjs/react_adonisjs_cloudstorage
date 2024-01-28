import Case from 'App/Models/Case'
import Company from 'App/Models/Company'
import Custodian from 'App/Models/Custodian'
import Acquisition from 'App/Models/Acquisition'

export default class EvidenceFileNamer {
  private acquisition: Acquisition
  private serviceName: string
  private serviceItemName: string
  private fileEnding: string
  private nonce: string
  public segments: string[] = []

  constructor(
    acquisition: Acquisition,
    serviceName: string,
    serviceItemName: string,
    nonce: string,
    fileEnding: string
  ) {
    this.acquisition = acquisition
    this.serviceName = serviceName
    this.serviceItemName = serviceItemName
    this.nonce = nonce
    this.fileEnding = fileEnding
  }

  public async getPath(): Promise<string> {
    await this.setSegments()
    return this.segments.join('/')
  }

  private async setSegments() {
    const custodian = await Custodian.query()
      .select(['id', 'case_id'])
      .where('id', this.acquisition.custodianId)
      .firstOrFail()

    const caseInstance = await Case.query()
      .select(['id', 'company_id'])
      .where('id', custodian.caseId)
      .firstOrFail()

    const company = await Company.query()
      .select(['id'])
      .where('id', caseInstance.companyId)
      .firstOrFail()

    const taxonomy = this.serviceItemTaxons()
    let taxon = taxonomy.get(this.serviceItemName)

    if (taxon === undefined) {
      taxon = 'item'
    }

    this.segments.push(`company-${company.id}`)
    this.segments.push(`case-${caseInstance.id}`)
    this.segments.push(`custodian-${custodian.id}`)
    this.segments.push(`acquisition-${this.acquisition.id}`)
    this.segments.push(`service-${this.serviceName}`)
    this.segments.push(`service-item-${this.serviceItemName}`)
    this.segments.push(`nonce-${this.nonce}`)
    this.segments.push(`${taxon}-${this.fileEnding}`)
  }

  private serviceItemTaxons(): Map<string, string> {
    const taxonomy = new Map<string, string>()

    taxonomy.set('Uber Account Information', 'user')
    taxonomy.set('Uber Trip History', 'history-item')

    return taxonomy
  }
}
