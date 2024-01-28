import { useAxios } from 'Lib'
import { createContext, useRef } from 'react'

/** Data */
import ManageUsersContainer from './Containers/ManageUsersContainer'
import useObserver from 'pojo-observer'

interface Props {
  children: React.ReactNode
}

export interface ManageUsersStore {
  manageUsers: ManageUsersContainer
}

const placeholder = {} as ManageUsersStore
export const ManageUsersContext = createContext<ManageUsersStore>(placeholder)

export default function ManageUsersProvider(props: Props) {
  const { children } = props
  const axios = useAxios()
  const usersContainer = useRef<ManageUsersContainer>(new ManageUsersContainer(axios))
  const manageUsers = useObserver(usersContainer.current)

  return (
    <ManageUsersContext.Provider value={{ manageUsers }}>
      <>{children}</>
    </ManageUsersContext.Provider>
  )
}
