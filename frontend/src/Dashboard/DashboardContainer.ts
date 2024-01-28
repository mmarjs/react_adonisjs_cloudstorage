import { AxiosInstance } from 'axios'
import BaseContainer from 'Lib/BaseContainer'
import { DashboardData } from 'types'

export default class DashboardContainer extends BaseContainer {
  private axios: AxiosInstance
  private _dashboard: DashboardData

  constructor(axios: AxiosInstance) {
    super()
    this.axios = axios
    this.isLoading = true
    this._dashboard = {
      userCount: 0,
      caseCount: 0,
      custodianCount: 0,
      requestCount: 0,
      activeLockerCount: 0,
      archiveLockerCount: 0,
      currentBillable: 0,
      companyTotalFileSizes: 0,
    }
  }

  public async loadDashboard() {
    try {
      const { data } = await this.axios.get<DashboardData>('/dashboard')
      this._dashboard = data
    } catch {
      this.errorMessage = 'Failed to fetch dashboard'
      this.isError = true
    } finally {
      this.isLoading = false
    }
  }

  public get dashboard() {
    return this._dashboard
  }
}
