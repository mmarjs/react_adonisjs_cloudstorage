import BaseContainer from 'Lib/BaseContainer'
import { toSafeInteger } from 'lodash'
import { AxiosError, AxiosInstance } from 'axios'
import {
  ShowUserResponse,
  ShowUserState,
  ShowUserCase,
  UpdateUserParams,
  AccountRole,
  UserCreateData,
  UserStatus,
} from 'types'

export default class EditUserContainer extends BaseContainer {
  private userId: number = 0
  private axios: AxiosInstance
  private _states: ShowUserState[] = []
  private _cases: ShowUserCase[] = []
  private _permitted_cases: number[] = []
  private _showCases: boolean = false
  private _company_name: string = ''
  private _first_name: string = ''
  private _last_name: string = ''
  private _email: string = ''
  private _role: AccountRole = 'client-user'
  private _status: UserStatus = 'invited'
  private _street: string = ''
  private _city: string = ''
  private _state: string = ''
  private _zip: number = 0
  private _phone: string = ''

  constructor(userId: number, axios: AxiosInstance) {
    super()
    this.userId = userId
    this.axios = axios
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

  public async loadUser() {
    try {
      this.isLoading = true
      const {
        data: { cases: allCases },
      } = await this.axios.get<UserCreateData>('/users/reqs')

      const {
        data: { user, role, cases: permittedCases, states },
      } = await this.axios.get<ShowUserResponse>(`/users/${this.userId}/show`)

      this._cases = allCases
      this._states = states
      this._permitted_cases = permittedCases.map((c) => c.id)
      this.companyName = user.company_name
      this.firstName = user.first_name
      this.lastName = user.last_name
      this.email = user.email
      this.role = role
      this.street = user.street
      this.city = user.city
      this.state = user.state
      this.zip = user.zip
      this.phone = user.phone
      this.status = user.status
    } catch (err) {
      this.isError = true
      this.errorMessage = 'Failed to load form'
    } finally {
      this.isLoading = false
    }
  }

  public async updateUser() {
    const params: UpdateUserParams = {
      first_name: this.firstName,
      last_name: this.lastName,
      company_name: this.companyName,
      street: this.street,
      state: this.state,
      city: this.city,
      zip: toSafeInteger(this.zip),
      phone: this.phone,
      email: this.email,
      role: this.role,
      status: this.status,
      permitted_cases: this.permittedCases,
    }

    try {
      this.isLoading = true
      await this.axios.put<{ status: string }>(`/users/${this.userId}/update_account`, params)

      this.isSuccess = true
      this.successMessage = 'The user was updated.'
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

  set showCases(val: boolean) {
    this._showCases = val
  }

  get showCases() {
    return this._showCases
  }

  set role(role: AccountRole) {
    this._role = role
  }

  get role() {
    return this._role
  }

  set status(status: UserStatus) {
    this._status = status
  }

  get status() {
    return this._status
  }

  set firstName(val: string) {
    this._first_name = val
  }

  get firstName() {
    return this._first_name
  }

  set lastName(val: string) {
    this._last_name = val
  }

  get lastName() {
    return this._last_name
  }

  set email(val: string) {
    this._email = val
  }

  get email() {
    return this._email
  }

  set companyName(val: string) {
    this._company_name = val
  }

  get companyName() {
    return this._company_name
  }

  set street(val: string) {
    this._street = val
  }

  get street() {
    return this._street
  }

  set city(val: string) {
    this._city = val
  }

  get city() {
    return this._city
  }

  set state(val: string) {
    this._state = val
  }

  get state() {
    return this._state
  }

  set zip(val: number) {
    this._zip = val
  }

  get zip() {
    return this._zip
  }

  set phone(val: string) {
    this._phone = val
  }

  get phone() {
    return this._phone
  }

  get cases() {
    return this._cases
  }

  get states() {
    return this._states
  }

  set permittedCases(data: number[]) {
    this._permitted_cases = data
  }

  get permittedCases() {
    return this._permitted_cases
  }
}
