import { createSlice } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

interface AuthState {
  loggedIn: boolean
  token: string
  timestamp?: string
}

const initialState: AuthState = {
  loggedIn: false,
  token: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setLogin: (state, action) => {
      state.loggedIn = true
      state.token = action.payload
    },
    refreshTimestamp: (state, action) => {
      state.timestamp = dayjs().format()
    },
    logout: (state) => {
      state.loggedIn = false
      state.timestamp = undefined
    },
  },
})

export const { setLogin, logout, refreshTimestamp } = authSlice.actions
export default authSlice.reducer
