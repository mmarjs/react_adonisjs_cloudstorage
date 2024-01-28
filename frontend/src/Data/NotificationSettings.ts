import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NotificationSetting } from 'types'

interface NotificationSettings {
  settings: NotificationSetting[]
}

const initialState: NotificationSettings = {
  settings: [],
}

const notificationSettingsSlice = createSlice({
  name: 'notificationSettings',
  initialState: initialState,
  reducers: {
    setNotificationSettings: (state, action: PayloadAction<NotificationSetting[]>) => {
      state.settings = action.payload
    },
    setNotificationSetting: (state, action: PayloadAction<NotificationSetting>) => {
      const index = state.settings.findIndex((s) => s.id === action.payload.id)
      state.settings[index] = action.payload
    },
  },
})

export const { setNotificationSettings, setNotificationSetting } = notificationSettingsSlice.actions
export default notificationSettingsSlice.reducer
