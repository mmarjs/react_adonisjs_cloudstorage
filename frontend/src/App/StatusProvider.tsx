import { useState, useEffect, createContext } from 'react'
import { useSnackbar, VariantType } from 'notistack'

interface Props {
  children: React.ReactNode
}

type vertical = 'top' | 'bottom'
type horizontal = 'left' | 'center' | 'right'

export interface StatusStore {
  showStatus: (
    msg: string,
    type?: VariantType,
    vertical?: vertical,
    horizontal?: horizontal
  ) => void
}

const placeholder = {} as StatusStore
export const StatusContext = createContext<StatusStore>(placeholder)

export function StatusProvider(props: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const [message, setMessage] = useState('')
  const [type, setType] = useState<VariantType>('info')
  const [vert, setVertical] = useState<vertical>('bottom')
  const [horiz, setHorizontal] = useState<horizontal>('left')

  useEffect(() => {
    if (message !== '') {
      enqueueSnackbar(message, {
        variant: type,
        anchorOrigin: {
          vertical: vert,
          horizontal: horiz,
        },
      })
    }
  }, [message])

  const showStatus = (
    msg: string,
    type: VariantType = 'success',
    vertical: vertical = 'bottom',
    horizontal: horizontal = 'left'
  ) => {
    setType(type)
    setVertical(vertical)
    setHorizontal(horizontal)
    setMessage(msg)

    setTimeout(() => {
      setMessage('')
    }, 200)
  }

  return (
    <StatusContext.Provider value={{ showStatus }}>
      <>{props.children}</>
    </StatusContext.Provider>
  )
}
