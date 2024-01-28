import { AxiosInstance } from 'axios'
import { ShowUserInfo, EmployeeInfo, ShowUsersResponse } from 'types'
import BaseContainer from 'Lib/BaseContainer'
import UserSearch from '../Search/UserSearch'

export default class ManageUsersContainer extends BaseContainer {
  private axios: AxiosInstance
  private _users: ShowUserInfo[] = []
  private _userId: number = 0
  private _employeeInfo: EmployeeInfo = { max: 0, current: 0 }
  private _clientInviteModalOpen: boolean = false
  private _clientEditModalOpen: boolean = false
  private _employeeInviteModalOpen: boolean = false
  private _employeeEditModalOpen: boolean = false
  private _searchTerms: string = ''
  private _originalUsers: ShowUserInfo[] = []

  constructor(axios: AxiosInstance) {
    super()
    this.isLoading = true
    this.axios = axios
  }

  public async loadUsers() {
    this.isLoading = true
    await this.axios
      .get<ShowUsersResponse>('/users')
      .then((res) => {
        this.users = res.data.users
        this._originalUsers = res.data.users
        this._employeeInfo = res.data.employeeInfo
      })
      .catch((err) => {
        this.errorMessage = 'Failed to load users'
      })
      .finally(() => {
        this.isLoading = false
      })
  }

  public search() {
    const search = new UserSearch(this._searchTerms, this._users)
    const res = search.search()
    this.users = res
  }

  public resetSearch() {
    this.searchTerms = ''
    this.users = this._originalUsers
  }

  public get users() {
    return this._users
  }

  public set users(items: ShowUserInfo[]) {
    this._users = items
  }

  public get employeeInfo() {
    return this._employeeInfo
  }

  public set userId(userId: number) {
    this._userId = userId
  }

  public get userId() {
    return this._userId
  }

  public set clientInviteModalOpen(open: boolean) {
    this._clientInviteModalOpen = open
  }

  public get clientInviteModalOpen() {
    return this._clientInviteModalOpen
  }

  public set clientEditModalOpen(open: boolean) {
    this._clientEditModalOpen = open
  }

  public get clientEditModalOpen() {
    return this._clientEditModalOpen
  }

  public set employeeInviteModalOpen(open: boolean) {
    this._employeeInviteModalOpen = open
  }

  public get employeeInviteModalOpen() {
    return this._employeeInviteModalOpen
  }

  public set employeeEditModalOpen(open: boolean) {
    this._employeeEditModalOpen = open
  }

  public get employeeEditModalOpen() {
    return this._employeeEditModalOpen
  }

  public set searchTerms(terms: string) {
    this._searchTerms = terms
  }

  public get searchTerms() {
    return this._searchTerms
  }
}
