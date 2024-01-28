import { combineReducers } from 'redux'
import authReducer from 'Data/Auth'
import casesReducer from 'Data/Cases'
import companyReducer from 'Data/Company'
import uiReducer from 'Data/UI'
import sidebarReducer from 'Data/Sidebar'
import shareReducer from 'Data/Share'
import tableViewReducer from 'Data/TableViewDataList'
import workspaceReducer from 'Data/Workspace'
import userReducer from 'Data/User'
import notificationsReducer from 'Data/Notifications'
import notificationSettingsReducer from 'Data/NotificationSettings'
import permissionsReducer from 'Data/Permissions'

const appReducer = combineReducers({
  auth: authReducer,
  cases: casesReducer,
  company: companyReducer,
  ui: uiReducer,
  sidebar: sidebarReducer,
  user: userReducer,
  tableViewData: tableViewReducer,
  workspaceData: workspaceReducer,
  share: shareReducer,
  notifications: notificationsReducer,
  notificationSettings: notificationSettingsReducer,
  permissions: permissionsReducer,
})

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET') {
    state = undefined
  }
  return appReducer(state, action)
}

export type AppState = ReturnType<typeof rootReducer>

export default rootReducer
