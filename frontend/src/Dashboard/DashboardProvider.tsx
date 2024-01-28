import { createContext, useRef } from 'react'

/** Data */
import DashboardContainer from './DashboardContainer'
import useObserver from 'pojo-observer'
import { useAxios } from 'Lib'

interface Props {
  children: React.ReactNode
}

export interface DashboardStore {
  data: DashboardContainer
}

const placeholder = {} as DashboardStore
export const DashboardContext = createContext<DashboardStore>(placeholder)

export default function DashboardProvider(props: Props) {
  const { children } = props
  const axios = useAxios()
  const container = useRef<DashboardContainer>(new DashboardContainer(axios))
  const data = useObserver(container.current)

  return (
    <DashboardContext.Provider value={{ data }}>
      <>{children}</>
    </DashboardContext.Provider>
  )
}
