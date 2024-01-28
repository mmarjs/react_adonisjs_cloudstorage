import { useEffect, useRef } from 'react'

interface ReturnValues {
  setSafely: (...args: any) => void
  isMounted: React.MutableRefObject<boolean>
}

export function useIsMounted(): ReturnValues {
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  function setSafely(cb: (...args: any) => void, args?: any) {
    if (isMounted.current) {
      if (typeof args === 'boolean') {
        cb(args)
        return
      }
    }

    if (args) {
      cb(args)
    } else {
      cb()
    }
  }

  return { setSafely, isMounted }
}
