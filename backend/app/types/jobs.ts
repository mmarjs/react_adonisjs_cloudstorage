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

export interface PasswordResetJobParams {
  passwordResetId: number
}

export interface RecordActivityParams {
  token: string
  event: string
  subject: string
  companyExtra?: string
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
