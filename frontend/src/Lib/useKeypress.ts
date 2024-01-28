import { useEffect } from 'react'
export function useKeypress(key: string, action: any) {
  useEffect(() => {
    function onKeyup(e: any) {
      if (e.key === key) action()
    }
    window.addEventListener('keyup', onKeyup)
    return () => window.removeEventListener('keyup', onKeyup)
  }, [key, action])
}
