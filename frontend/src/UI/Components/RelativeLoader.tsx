import makeStyles from '@material-ui/core/styles/makeStyles'
import CircularProgress from '@material-ui/core/CircularProgress'

interface Props {
  px?: number
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    justifyContent: 'center',
    alignContent: 'center',
  },
  wrapper: {
    height: '100%',
    width: '100%',
  },
}))

export function RelativeLoader(props: Props) {
  const { px } = props
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <CircularProgress size={px ?? 60} color="primary" />
      </div>
    </div>
  )
}
