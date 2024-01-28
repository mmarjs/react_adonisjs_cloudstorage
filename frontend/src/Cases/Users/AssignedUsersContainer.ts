import { AxiosError, AxiosInstance } from 'axios'
import BaseContainer from 'Lib/BaseContainer'
import {
  ShowCaseResponse,
  AssignedUserData,
  AssignedUser,
  CaseType,
  TimeZone,
  Case,
  CasePermissionParams,
  AvailableUserCaseOption,
} from 'types'

export default class AssignedUsersContainer extends BaseContainer {
  private caseId: number
  private axios: AxiosInstance
  private _users: AssignedUser[] = []
  private _available: AssignedUser[] = []
  private _caseTypes: CaseType[] = []
  private _timeZones: TimeZone[] = []
  private _case?: Case

  constructor(caseId: number, axios: AxiosInstance) {
    super()
    this.caseId = caseId
    this.axios = axios
  }

  public setIsLoading(val: boolean) {
    this.isLoading = val
  }

  public async loadCurrentCase() {
    try {
      const { data } = await this.axios.get<ShowCaseResponse>(`/cases/${this.caseId}/show`)
      this.case = data.caseInstance
      this.caseTypes = data.caseTypes
      this.timeZones = data.timeZones
    } catch (err) {
      const error = err as AxiosError
      this.isError = true
      this.errorMessage = error.message
    }
  }

  public async loadAssignedUsers() {
    try {
      const { data } = await this.axios.get<AssignedUserData>(
        `/cases/${this.caseId}/assigned_users`
      )
      this.users = data.users
      this.available = data.available
    } catch (err) {
      this.isError = true
      this.errorMessage = 'Failed to fetch assigned users'
    }
  }

  public async addUser(params: CasePermissionParams) {
    try {
      this.isLoading = true
      await this.axios.post(`/cases/${this.caseId}/add_user`, params)
      this.successMessage = 'A user was successfully added!'
      await this.loadAssignedUsers()
    } catch (err) {
      this.isError = true
      this.errorMessage = 'A user could not be renamed, please try again'
    } finally {
      await this.loadAssignedUsers()
      this.isLoading = false
    }
  }

  public async removeUser(params: CasePermissionParams) {
    try {
      this.isLoading = true
      await this.axios.delete(`/cases/${this.caseId}/remove_user`, { params: params })
      this.successMessage = 'The user was successfully removed from the case!'
      await this.loadAssignedUsers()
    } catch (err) {
      this.isError = true
      this.errorMessage = 'The user could not be removed from the case, please try again'
    } finally {
      await this.loadAssignedUsers()
      this.isLoading = false
    }
  }

  public get users() {
    return this._users
  }

  public set users(data: AssignedUser[]) {
    this._users = data
  }

  public get available() {
    return this._available
  }

  public set available(data: AssignedUser[]) {
    this._available = data
  }

  public get caseTypes() {
    return this._caseTypes
  }

  public set caseTypes(data: CaseType[]) {
    this._caseTypes = data
  }

  public get timeZones() {
    return this._timeZones
  }

  public set timeZones(data: TimeZone[]) {
    this._timeZones = data
  }

  public set case(data: Case) {
    this._case = data
  }

  public get case() {
    return this._case as Case
  }

  public makeAvailableOptions() {
    const data: AvailableUserCaseOption[] = []
    for (let user of this.available) {
      data.push({
        title: `${user.first_name} ${user.last_name} (${user.email})`,
        id: user.user_id,
      })
    }

    return data
  }
}
