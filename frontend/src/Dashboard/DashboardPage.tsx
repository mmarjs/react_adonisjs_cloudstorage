import { useContext, useEffect } from 'react'

/** Data */
import DashboardProvider, { DashboardContext } from './DashboardProvider'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'

/** UI Views */
import { Admin } from './Users/Admin'
import { CaseManager } from './Users/CaseManager'
import { ClientUser } from './Users/ClientUser'
import { Template } from 'UI'

/** Helpers */
import { isAdmin, isCaseManager, isClientUser } from 'Lib'
import useStatus from 'Lib/useStatus'
import { AccountRole } from 'types'

export function DashboardPage() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  )
}
export function Dashboard() {
  const { data } = useContext(DashboardContext)
  const role = useSelector((state: AppState) => state.user.role) as AccountRole

  useStatus({ success: data.successMessage, error: data.errorMessage })

  useEffect(() => {
    data.loadDashboard().then(() => {})
  }, [])

  return (
    <Template
      title="Dashboard"
      isLoading={data.isLoading}
      isError={data.isError}
      errorMessage={data.errorMessage}
    >
      {isAdmin(role) && <Admin />}
      {isCaseManager(role) && <CaseManager />}
      {isClientUser(role) && <ClientUser />}
    </Template>
  )
}
