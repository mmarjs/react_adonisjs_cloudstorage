import { SelectedCollectionAccountItem, User } from './redux'
import { ActiveFileItem } from 'Upload/types'
import { PluginOptions } from '@uppy/core'

export interface AcquisitionForm {
  acquisitionType: string
  acquisitionAction: string
  cloudAccountUsername: string
  custodianId: number
  serviceItemIds: number[]
  after?: string
  before?: string
}

export interface AddCaseFormValues {
  case_name: string
  client_name: string
  client_reference: string
  client_phone: string
  client_email: string
  case_type_id: number
  time_zone_id: number
  notes: string
}

export type CaseStatusOption = 'active' | 'archive' | 'delete'

export interface CustodianDetailsForm {
  name: string
  alias?: string
  phone?: string
  email: string
  type: string
  notes?: string
}

export interface CustodianRequestParams {
  case_id: number
  selectedCollection: string | null
  name: string
  alias?: string
  phone?: string
  type: string
  notes?: string
  acquisition_type: string
  cloud_account_username: string
  auth_email: string
  selectedItems: SelectedCollectionAccountItem[]
  before: string | null
  after: string | null
}

export interface EditCaseFormValues {
  case_name: string
  client_name: string
  client_reference: string
  client_phone: string
  client_email: string
  case_type_id: number
  time_zone_id: number
  notes: string
  status: 'active' | 'archived'
  confirmDelete?: string
}

export type FormParams = object

export type PersonalInfoForms = 'name' | 'phone' | 'address' | null

export interface UserFormProps {
  user: User
  setShowForm: (form: PersonalInfoForms) => void
}
export interface UploadEvdienceCommon {
  collectedBy: string
  dateCollected: string
  notes: string
}

export interface UploadEvidenceCloudAccountForm extends UploadEvdienceCommon {
  company: string
  product: string
}

export type ComputerImageType =
  | 'Physical Image'
  | 'Logical Image'
  | 'Targeted Image'
  | 'Select Files'

export interface UploadEvidenceComputerForm extends UploadEvdienceCommon {
  evdienceId: number | string
  make: string
  serial: string
  imageType: ComputerImageType
}

export type UploadEmailType = 'PST' | 'PDF' | 'Mbox'

export interface UploadEvidenceEmailForm extends UploadEvdienceCommon {
  mailClient: string
  emailType: UploadEmailType
}

export type UploadMobileOs = 'iOS' | 'Android' | 'Blackberry' | 'Other'

export interface UploadMobileForm extends UploadEvdienceCommon {
  manufacturer: string
  os: UploadMobileOs
  imageType: string
}

export interface UploadNetworkShareForm extends UploadEvdienceCommon {
  shareType: string
}

export interface UploadServerForm extends UploadEvdienceCommon {
  serverName: string
  serverOs: string
  containerType: string
}

export interface UploadUSBDeviceForm extends UploadEvdienceCommon {
  name: string
  containerType: string
}

export interface UploadOtherForm extends UploadEvdienceCommon {
  name: string
  containerType: string
}

export type UploadFormValues =
  | UploadEvidenceCloudAccountForm
  | UploadEvidenceEmailForm
  | UploadMobileForm
  | UploadNetworkShareForm
  | UploadServerForm
  | UploadUSBDeviceForm
  | UploadOtherForm

export type UploadFormName =
  | 'Cloud Account'
  | 'Email'
  | 'Mobile'
  | 'Network Share'
  | 'Server'
  | 'USB Device'
  | 'Other'

export type UploadCategory = 'workgroup' | 'personal' | 'evidence' | 'shared' | ''
export type DownloadCategory = 'workgroup' | 'personal' | 'shared'

export interface UploadProps {
  category: UploadCategory
  categoryId: number
  folderId: number
  filenames: string[]
  display: 'inline' | 'modal'
  open?: boolean
  trigger?: string
  shareLinkId?: number
  onRequestClose?: () => void
  onFechData?: () => void
}

export interface UppyFile {
  id: string
}

export interface RecordFileOptions extends PluginOptions {
  fileItems: Map<string, ActiveFileItem>
}
