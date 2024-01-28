import Case from 'App/Models/Case'
import { CaseSearchParams } from 'App/types'

export default class CaseSearch {
  public caseIds: number[]
  public params: CaseSearchParams

  constructor(caseIds: number[], params: CaseSearchParams) {
    this.caseIds = caseIds
    this.params = params
  }

  public async search(): Promise<Case[]> {
    if (this.params.type === 'simple') {
      return await this.simple()
    }

    return await this.advanced()
  }

  public async simple() {
    return Case.query()
      .whereIn('id', this.caseIds)
      .where((query) => {
        query
          .orWhere('case_name', 'LIKE', `%${this.params.search}%`)
          .orWhere('public_case_id', 'LIKE', `%${this.params.search}%`)
          .orWhere('client_name', 'LIKE', `%${this.params.search}%`)
      })
      .reporterData({ name: 'CaseSearch.simple' })
  }

  public async advanced() {
    return []
  }
}
