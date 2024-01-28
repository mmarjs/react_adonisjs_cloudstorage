import React from 'react'
import LogRocket from 'logrocket'

interface Props {
  children: React.ReactNode
  logrocket: typeof LogRocket
}

export const LogRocketContext = React.createContext<undefined | typeof LogRocket>(undefined)

export function LogRocketProvider(props: Props) {
  const { logrocket, children } = props

  return (
    <LogRocketContext.Provider value={logrocket}>
      <>{children}</>
    </LogRocketContext.Provider>
  )
}
