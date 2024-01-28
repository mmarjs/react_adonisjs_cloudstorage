import { createSlice } from '@reduxjs/toolkit'
import { Sidebar } from 'types'

const initialState: Sidebar = {
  open: false,
  fixed: false,
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: initialState,
  reducers: {
    setOpen: (state, action) => {
      state.open = action.payload
    },
    setFixed: (state, action) => {
      state.fixed = action.payload
    },
  },
})

export const { setOpen, setFixed } = sidebarSlice.actions
export default sidebarSlice.reducer
