import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BillingStatus, Company } from 'types'

const initialState: Company = {
  id: 0,
  user_id: 0,
  name: '',
  is_enterprise: 0,
  is_enterprise_subscriber: 0,
  is_two_factor_required: false,
  has_multiple: false,
  billing_status: 'unactivated',
  channel: '',
}

const companySlice = createSlice({
  name: 'company',
  initialState: initialState,
  reducers: {
    setCompany: (state, action) => {
      const data = action.payload as Company
      state.id = data.id
      state.user_id = data.user_id
      state.name = data.name
      state.is_enterprise = data.is_enterprise
      state.is_enterprise_subscriber = data.is_enterprise_subscriber
      state.is_two_factor_required = data.is_two_factor_required
      state.billing_status = data.billing_status
      state.channel = data.channel
    },
    setHasMultiple: (state, action: PayloadAction<boolean>) => {
      state.has_multiple = action.payload
    },
    setBillingStatus: (state, action: PayloadAction<BillingStatus>) => {
      state.billing_status = action.payload
    },
    setIsTwoFactorRequired: (state, action: PayloadAction<boolean>) => {
      state.is_two_factor_required = action.payload
    },
  },
})

export const {
  setCompany,
  setHasMultiple,
  setBillingStatus,
  setIsTwoFactorRequired,
} = companySlice.actions
export default companySlice.reducer
