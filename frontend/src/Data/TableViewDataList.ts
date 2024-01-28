import { createSlice } from '@reduxjs/toolkit'
import { TableDataList } from 'types'

const initialState: TableDataList = {
  fieldList: [],
  fieldListByService: [],
  fieldServiceId: '',
  tableDataByService: [],
  filterFlag: false,
  selectRowDetail: [],
  fieldNodeId: 0,
  selectedFolderFileIds: [],
  selectedFolders: [],
  tableViewMode: false,
}

const fieldLitDataSlice = createSlice({
  name: 'collapse',
  initialState: initialState,
  reducers: {
    setFieldList: (state, action) => {
      state.fieldList = action.payload
    },
    setFieldListByService: (state, action) => {
      state.fieldListByService = action.payload
    },
    setFieldServiceId: (state, action) => {
      state.fieldServiceId = action.payload
    },
    setTableDataByService: (state, action) => {
      state.tableDataByService = action.payload
    },
    setClearTableData: (state, action) => {
      state.filterFlag = false
      state.selectRowDetail = action.payload
      state.fieldServiceId = ''
      state.fieldNodeId = 0
    },
    setFilterFlag: (state, action) => {
      state.filterFlag = action.payload
    },
    setSelectRowDetail: (state, action) => {
      state.selectRowDetail = action.payload
    },
    setFieldNodeId: (state, action) => {
      state.fieldNodeId = action.payload
    },
    setSelectedFolderFileIds: (state, action) => {
      state.selectedFolderFileIds = action.payload
    },
    setSelectedFolders: (state, action) => {
      state.selectedFolders = action.payload
    },
    setTableViewMode: (state, action) => {
      state.tableViewMode = action.payload
    },
  },
})
export const {
  setFieldList,
  setFieldListByService,
  setFieldServiceId,
  setTableDataByService,
  setClearTableData,
  setFilterFlag,
  setSelectRowDetail,
  setFieldNodeId,
  setSelectedFolderFileIds,
  setSelectedFolders,
  setTableViewMode,
} = fieldLitDataSlice.actions
export default fieldLitDataSlice.reducer
