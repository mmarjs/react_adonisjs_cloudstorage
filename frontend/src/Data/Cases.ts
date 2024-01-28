import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Case, TotalFileSizeByCase, AssignedUserCount } from 'types'
import dayjs from 'dayjs'

interface Cases {
  lastFetched?: string
  cases: Case[]
  activeCases: Case[]
  searchCases: Case[]
  totalFileSizeByCase: TotalFileSizeByCase[]
  assignedUserCount: AssignedUserCount[]
}

const initialState: Cases = {
  cases: [],
  activeCases: [],
  searchCases: [],
  totalFileSizeByCase: [],
  assignedUserCount: [],
}

const casesSlice = createSlice({
  name: 'cases',
  initialState: initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.cases = action.payload
      state.lastFetched = dayjs().format()
    },
    setActiveCases: (state, action: PayloadAction<Case[]>) => {
      state.activeCases = action.payload
      state.lastFetched = dayjs().format()
    },
    setSearchCases: (state, action: PayloadAction<Case[]>) => {
      state.searchCases = action.payload
      state.lastFetched = dayjs().format()
    },
    setTotalFileSizeByCase: (state, action: PayloadAction<TotalFileSizeByCase[]>) => {
      state.totalFileSizeByCase = action.payload
    },
    setAssignedUserCount: (state, action: PayloadAction<AssignedUserCount[]>) => {
      state.assignedUserCount = action.payload
    },
  },
})

export const {
  setCases,
  setActiveCases,
  setSearchCases,
  setTotalFileSizeByCase,
  setAssignedUserCount,
} = casesSlice.actions
export default casesSlice.reducer
