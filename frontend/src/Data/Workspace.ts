import { createSlice } from '@reduxjs/toolkit'
import { WorkspaceData } from 'types'

const initialState: WorkspaceData = {
  collapseOption: {
    workgroup: false,
    personal: false,
    share: false,
    recycle: false,
  },
  subBreadcrumb: [],
  shareMode: '',
  groupId: '',
  caseId: 0,
  workGroupData: [],
  personalData: [],
  expendTreeData: {
    users: [],
    workGroupData: [],
    personalData: [],
  },
  workgroupParentId: 0,
  personalParentId: 0,
  workspaceUsers: [],
  caseData: [],
  isContextMenu: false,
  currentFileName: '',
  currentFileIdByContext: 0,
  contextFileType: '',
  pendingNotification: {
    isPending: false,
    pendingText: '',
    isDone: false,
  },
  shareFormOpen: false,
  shareLinkData: [],
  shareUpdateData: [],
  searchFlag: false,
  workspacePath: '',
  isLoader: true,
  mode: '',
  collpaseOpen: false,
  collapseFixed: false,
}

const workSpaceSlice = createSlice({
  name: 'collapse',
  initialState: initialState,
  reducers: {
    setCollapseOption: (state, action) => {
      state.collapseOption = action.payload
    },
    setSubBreadcrumb: (state, action) => {
      state.subBreadcrumb = action.payload
    },
    setShareMode: (state, action) => {
      state.shareMode = action.payload
    },
    setCaseId: (state, action) => {
      state.caseId = action.payload
    },
    setWorkgroupParentId: (state, action) => {
      state.workgroupParentId = action.payload
    },
    setPersonalParentId: (state, action) => {
      state.personalParentId = action.payload
    },
    setWorkspaceUsers: (state, action) => {
      state.workspaceUsers = action.payload
    },
    setSelectedCaseData: (state, action) => {
      state.caseData = action.payload
    },
    setIsContextMenu: (state, action) => {
      state.isContextMenu = action.payload
    },
    setCurrentFileName: (state, action) => {
      state.currentFileName = action.payload
    },
    setCurrentFileIdByContext: (state, action) => {
      state.currentFileIdByContext = action.payload
    },
    setContextFileType: (state, action) => {
      state.contextFileType = action.payload
    },
    setPendingNotification: (state, action) => {
      state.pendingNotification = action.payload
    },
    setShareFormOpen: (state, action) => {
      state.shareFormOpen = action.payload
    },
    setShareLinkData: (state, action) => {
      state.shareLinkData = action.payload
    },
    setShareUpdateData: (state, action) => {
      state.shareUpdateData = action.payload
    },
    setSearchFlag: (state, action) => {
      state.searchFlag = action.payload
    },
    setIsLoader: (state, action) => {
      state.isLoader = action.payload
    },
    setSwitchViewMode: (state, action) => {
      state.mode = action.payload
    },
    setCollapseOpen: (state, action) => {
      state.collapseOption = action.payload
    },
    setCollapseFixed: (state, action) => {
      state.collapseFixed = action.payload
    },
  },
})

export const {
  setCollapseOption,
  setSubBreadcrumb,
  setShareMode,
  setCaseId,
  setWorkgroupParentId,
  setPersonalParentId,
  setWorkspaceUsers,
  setSelectedCaseData,
  setIsContextMenu,
  setCurrentFileName,
  setCurrentFileIdByContext,
  setContextFileType,
  setPendingNotification,
  setShareFormOpen,
  setShareLinkData,
  setShareUpdateData,
  setSearchFlag,
  setIsLoader,
  setSwitchViewMode,
  setCollapseOpen,
  setCollapseFixed,
} = workSpaceSlice.actions
export default workSpaceSlice.reducer
