import React from 'react'
import { NotFound } from 'App/ErrorPages'
import { isEmpty } from 'lodash-es'

interface Props {
  resource: any
  isLoading: boolean
  children: React.ReactNode
}

export function HandleResource(props: Props) {
  const { isLoading, resource } = props

  if (isLoading === false && resource === undefined) {
    if (isEmpty(resource)) {
      return <NotFound />
    }
  }

  return <>{props.children}</>
}
