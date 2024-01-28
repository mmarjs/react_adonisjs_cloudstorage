import Case from 'App/Models/Case'
import CaseType from 'App/Models/CaseType'
import TimeZone from 'App/Models/TimeZone'
import { CaseReqs, ShowCaseResponse } from 'App/types'

export default class ShowCase {
  public caseId: number

  constructor(caseId: number) {
    this.caseId = caseId
  }

  public async show(): Promise<ShowCaseResponse | null> {
    const caseInstance = await Case.query()
      .preload('createdBy', (q) => q.select(['first_name', 'last_name']))
      .where('id', this.caseId)
      .first()

    if (caseInstance === null) {
      return null
    }

    const reqs = await this.reqs()

    return {
      caseInstance: caseInstance,
      ...reqs,
    }
  }

  public async reqs(): Promise<CaseReqs> {
    const caseTypes = await CaseType.query().select('id', 'name').orderBy('name', 'asc')
    const timeZones = await TimeZone.query().select('id', 'local').orderBy('id', 'asc')

    return {
      caseTypes,
      timeZones,
    }
  }
}
