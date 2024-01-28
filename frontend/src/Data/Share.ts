import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { ShareDataStore, ShareLink } from 'types'

const emptyShareLink: ShareLink = {
  id: 0,
  granted_by_id: 0,
  link: '',
  first_name: '',
  last_name: '',
  resource: '',
  resource_id: 0,
  folder_id: 0,
  can_update_password: false,
  can_trash: false,
  share_type: 'download',
  expires_at: null,
}
const initialState: ShareDataStore = {
  loggedIn: false,
  token: '',
  shareLink: emptyShareLink,
  grantor: '',
  grantorCompany: '',
  hasLoggedInBefore: false,
  files: [],
  sharedFileData: [],
}

const shareSlice = createSlice({
  name: 'collapse',
  initialState: initialState,
  reducers: {
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    setTimeStamp: (state, action) => {
      state.timestamp = dayjs().toISOString()
    },
    setShareLogout: (state, action) => {
      state.loggedIn = false
    },
    setShareLink: (state, action) => {
      state.shareLink = action.payload
    },
    setGrantor: (state, action) => {
      state.grantor = action.payload
    },
    setGrantorCompany: (state, action) => {
      state.grantorCompany = action.payload
    },
    setHasLoggedInBefore: (state, action) => {
      state.hasLoggedInBefore = action.payload
    },
    setFiles: (state, action: PayloadAction<any[]>) => {
      state.files = action.payload
    },
    setSharedFileData: (state, action: PayloadAction<any[][]>) => {
      state.sharedFileData = action.payload
    },
  },
})

export const {
  setLoggedIn,
  setToken,
  setTimeStamp,
  setShareLogout,
  setShareLink,
  setGrantor,
  setGrantorCompany,
  setHasLoggedInBefore,
  setFiles,
  setSharedFileData,
} = shareSlice.actions
export default shareSlice.reducer
