import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, AccountRole } from 'types'

const initialState: User = {
  id: 0,
  first_name: '',
  last_name: '',
  role: 'guest',
  status: 'active',
  email: '',
  is_two_factor_required: false,
  channel: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      const data = action.payload as User

      state.id = data.id
      state.first_name = data.first_name
      state.last_name = data.last_name
      state.status = data.status
      state.email = data.email

      state.phone = data?.phone
      state.street = data?.street
      state.state = data?.state
      state.zip = data?.zip
      state.company_name = data?.company_name

      state.is_two_factor_required = data.is_two_factor_required
      state.two_factor_method = data?.two_factor_method ?? 'email'
      state.channel = data.channel

      state.created_at = data?.created_at
      state.updated_at = data?.updated_at
    },
    setRole: (state, action: PayloadAction<AccountRole>) => {
      state.role = action.payload
    },
  },
})

export const { setUser, setRole } = userSlice.actions
export default userSlice.reducer
