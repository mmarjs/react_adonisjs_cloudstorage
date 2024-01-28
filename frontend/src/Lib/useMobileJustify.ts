import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

type ReturnType = 'center' | 'flex-start'

export function useMobileJustify(): ReturnType {
  const theme = useTheme()
  const match = useMediaQuery(theme.breakpoints.down('md'))

  return match === true ? 'center' : 'flex-start'
}
