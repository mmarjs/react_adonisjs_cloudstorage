import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState } from 'types'

const initialState: UIState = {
  showArchived: false,
}

const UISlice = createSlice({
  name: 'ui',
  initialState: initialState,
  reducers: {
    setShowArchived: (state, action: PayloadAction<boolean>) => {
      state.showArchived = action.payload
    },
  },
})

export const { setShowArchived } = UISlice.actions
export default UISlice.reducer
