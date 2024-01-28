import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Permission } from 'types'

interface Permissions {
  permissions: Permission[]
}

const initialState: Permissions = {
  permissions: [],
}

const permissionsSlice = createSlice({
  name: 'permissionsslice',
  initialState: initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload
    },
  },
})

export const { setPermissions } = permissionsSlice.actions
export default permissionsSlice.reducer
