import { useAxios } from 'Lib'
import { createContext, useRef } from 'react'

/** Data */
import { AppState } from 'App/reducers'
import { useSelector } from 'react-redux'
import PreferencesContainer from 'Users/Profile/Preferences/PreferencesContainer'
import useObserver from 'pojo-observer'
import { AccountRole, Company } from 'types'

interface Props {
  children: React.ReactNode
}

export interface PreferencesStore {
  container: PreferencesContainer
  role: AccountRole
  company: Company
}

const placeholder = {} as PreferencesStore
export const PreferencesContext = createContext<PreferencesStore>(placeholder)

export default function PreferencesProvider(props: Props) {
  const { children } = props
  const axios = useAxios()
  const role = useSelector((state: AppState) => state.user.role) as AccountRole
  const company = useSelector((state: AppState) => state.company)
  const usersContainer = useRef<PreferencesContainer>(new PreferencesContainer(role, axios))
  const container = useObserver(usersContainer.current)

  return (
    <PreferencesContext.Provider value={{ container, role, company }}>
      <>{children}</>
    </PreferencesContext.Provider>
  )
}
