import BaseContainer from 'Lib/BaseContainer'
import { AxiosInstance } from 'axios'
import { produce } from 'immer'
import {
  NotificationSetting,
  UpdateSettingsParams,
  Preference,
  UpdatePreferenceParams,
  Company,
  AccountRole,
  UpdateCompanyParams,
  PreferenceName,
  EventName,
} from 'types'

type Section = 'account-info' | 'notification-settings' | 'preferences'

export default class PreferencesContainer extends BaseContainer {
  private role: AccountRole
  private axios: AxiosInstance
  private _settings: NotificationSetting[] = []
  private _preferences: Preference[] = []
  private _section: Section = 'notification-settings'

  constructor(role: AccountRole, axios: AxiosInstance) {
    super()
    this.role = role
    this.axios = axios

    if (['account-admin', 'account-owner'].includes(role)) {
      this._section = 'account-info'
    }
  }

  public async loadNotificationSettings() {
    try {
      this.isLoading = true
      const { data } = await this.axios.get<NotificationSetting[]>('/notification_settings')
      this.settings = data
    } catch (err) {
      this.isError = true
      this.errorMessage = 'Failed to load notification settings'
    } finally {
      this.isLoading = false
    }
  }

  public async saveNotificationSetting(name: EventName, params: UpdateSettingsParams) {
    try {
      const index = this._settings.findIndex((s) => s.event === name)
      const setting = this._settings[index]

      await this.axios.put<{ status: 'ok' }>(`/notification_settings/${setting?.id}/update`, params)

      const next = produce(this._settings, (draft) => {
        if (params.column === 'sendApp') {
          draft[index].sendApp = params.value
        }

        if (params.column === 'sendEmail') {
          draft[index].sendEmail = params.value
        }
      })

      this.settings = next
      this.successMessage = 'Saved notification setting'
    } catch (err) {
      this.errorMessage = 'Failed to save notification setting'
    }
  }

  public async loadPreferences() {
    try {
      this.isLoading = true
      const { data } = await this.axios.get<Preference[]>('/preferences')
      this.preferences = data
    } catch (err) {
      this.isError = true
      this.errorMessage = 'Failed to load notification settings'
    } finally {
      this.isLoading = false
    }
  }

  public async savePreference(name: PreferenceName, params: UpdatePreferenceParams) {
    const index = this._preferences.findIndex((p) => p.name === name)
    const preference = this._preferences[index]

    try {
      await this.axios.put<{ status: 'ok' }>(`/preferences/${preference?.id}/update`, params)

      const next = produce(this._preferences, (draft) => {
        draft[index].option = params.option
      })

      this.preferences = next

      this.successMessage = 'Preference was saved'
      return true
    } catch (err) {
      this.errorMessage = 'Failed to save preference'
      return false
    }
  }

  public async saveCompanySetting(companyId: number, params: UpdateCompanyParams) {
    try {
      const { data } = await this.axios.put<Company>(`/company/${companyId}/update`, params)
      this.successMessage = 'Company Preference Saved'
      return data
    } catch (err) {
      this.errorMessage = 'Failed to Save Company Preference'
      return null
    }
  }

  public get settings() {
    return this._settings
  }

  public set settings(settings: NotificationSetting[]) {
    this._settings = settings
  }

  public get preferences() {
    return this._preferences
  }

  public set preferences(preferences: Preference[]) {
    this._preferences = preferences
  }

  public get section() {
    return this._section
  }

  public set section(section: Section) {
    if (section === 'account-info' && !['account-admin', 'account-owner'].includes(this.role)) {
      return
    }

    this._section = section
  }

  public preferenceOption(name: PreferenceName): boolean {
    const pref = this._preferences.find((p) => p.name === name)

    return pref?.option ?? false
  }

  public settingOption(name: EventName, type: 'app' | 'email'): boolean {
    const setting = this._settings.find((s) => s.event === name)

    if (type === 'app') {
      return setting?.sendApp ?? false
    }
    return setting?.sendEmail ?? false
  }
}
