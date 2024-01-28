export interface AcquisitionJobParams {
  acquisitionId: number
}

export interface AcquisitionServiceCollectionParams {
  acquisitionId: number
  serviceItemId: number
}

export interface CustodianRequestJobParams {
  acquisitionId: number
}

export interface StoreEvidenceUrlParams {
  url: string
  acquisitionId: number
  serviceItemId: number
  acquisitionTaskId: number
  recordId: number
  recordTable: string
  recordColumn: string
}

export interface UberRequestJobParams {
  uberTripHistoryId: number
  serviceItemId: number
  acquisitionTaskId: number
}

export type AcquisitionTaskStatus = 'pending' | 'active' | 'failed' | 'finished' | 'canceled'

export interface CloudAcquisitionBody {
  acquisitionType: string
  acquisitionAction: string
  cloudAccountUsername: string
  custodianId: number
  serviceItemIds: number[]
  after?: string
  before?: string
}

export interface Service {}

export interface ServiceItem {
  name: string
  serviceId: number
  serviceItemId: number
}

export interface AuthorizationConfigOptions {
  authorizeUrl: string
  clientId: string
  clientSecret: string
  redirectUri?: string
  scopes?: string
  state: string
}

export interface SimpleOauthAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: 'offline_access'
  expires_at?: string
}
