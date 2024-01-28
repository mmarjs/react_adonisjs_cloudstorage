import { useEffect, useContext } from 'react'
import { StatusContext } from 'App/StatusProvider'

interface Props {
  success: string
  error: string
}

export default function useStatus(props: Props) {
  const { success, error } = props
  const { showStatus } = useContext(StatusContext)

  let a = success
  let b = error

  useEffect(() => {
    if (a !== '') {
      showStatus(success)
      a = ''
    }
  }, [success])

  useEffect(() => {
    if (b !== '') {
      showStatus(error, 'error')
      b = ''
    }
  }, [error])
}
