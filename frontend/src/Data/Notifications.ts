import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from 'types'

interface Notifications {
  notifications: Notification[]
}

const initialState: Notifications = {
  notifications: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
    },
  },
})

export const { setNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer
