import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

interface ReturnValues {
  xs: boolean
  sm: boolean
  md: boolean
  lg: boolean
}

export function useBreakpoints(): ReturnValues {
  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.down('xs'))
  const sm = useMediaQuery(theme.breakpoints.down('sm'))
  const md = useMediaQuery(theme.breakpoints.down('md'))
  const lg = useMediaQuery(theme.breakpoints.down('lg'))

  return {
    xs,
    sm,
    md,
    lg,
  }
}
