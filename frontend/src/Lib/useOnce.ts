import { useRef } from 'react'

export function useOnce(cb: () => void) {
  const ref = useRef(0)

  return () => {
    if (ref.current === 0) {
      cb()
      ref.current = 1
    }
  }
}
