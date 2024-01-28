import BaseContainer from 'Lib/BaseContainer'
import { AxiosError, AxiosInstance } from 'axios'
import {
  UserCreateData,
  UserCreateCase,
  UserCreateState,
  InviteUserParams,
  AccountRole,
} from 'types'

export default class InviteUserContainer extends BaseContainer {
  private axios: AxiosInstance
  private _states: UserCreateState[] = []
  private _cases: UserCreateCase[] = []
  private _permitted_cases: number[] = []
  private _showCases: boolean = false
  private _phone: string = ''
  private _state: string = ''
  private _role: AccountRole | '' = ''

  constructor(axios: AxiosInstance, defaultRole: AccountRole) {
    super()
    this.axios = axios
    this.role = defaultRole
  }

  public async loadReqs() {
    try {
      this.isLoading = true
      const { data } = await this.axios.get<UserCreateData>('/users/reqs')
      this._cases = data.cases
      this._states = data.states
    } catch (err) {
      this.isError = true
      this.errorMessage = 'Failed to load form'
    } finally {
      this.isLoading = false
    }
  }

  public async inviteUser(params: InviteUserParams) {
    try {
      this.isLoading = true
      await this.axios.post<{ status: string }>('/users/invite', params)

      this.isSuccess = true
      this.successMessage = 'The invitation is underway!'
    } catch (err) {
      const error = (err as unknown) as AxiosError

      this.isError = true

      if (error?.message === 'invalid-role-allocation') {
        this.errorMessage = 'As an account owner, you may not invite yourself.'
      }

      this.errorMessage = 'Could not invite user'
    } finally {
      this.isLoading = false
    }
  }

  public get states() {
    return this._states
  }

  public get cases() {
    return this._cases
  }

  public set permittedCases(data: number[]) {
    this._permitted_cases = data
  }

  public get permittedCases() {
    return this._permitted_cases
  }

  public set showCases(val: boolean) {
    this._showCases = val
  }

  public get showCases() {
    return this._showCases
  }

  public set phone(phone: string) {
    this._phone = phone
  }

  public get phone() {
    return this._phone
  }

  public set state(state: string) {
    this._state = state
  }

  public get state() {
    return this._state
  }

  public set role(role: AccountRole) {
    this._role = role
  }

  public get role() {
    return this._role as AccountRole
  }
}
