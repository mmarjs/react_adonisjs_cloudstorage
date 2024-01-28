export type PreferenceName =
  | 'collapse-main-menu-bar'
  | 'hide-archived-cases'
  | 'show-case-card-view'

export interface UpdatePreferenceParams {
  option: boolean
}
