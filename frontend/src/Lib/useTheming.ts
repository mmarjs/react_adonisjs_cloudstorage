import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles((theme) => ({
  row: {
    margin: '1rem 0',
  },
  textField: {
    '& input': {
      height: '1rem',
    },
  },
  phoneField: {
    '& input': {
      height: '1rem',
      paddingTop: '10.5px',
      paddingBottom: '10.5px',
    },
  },
  selectField: {
    '& input': {
      height: '1rem',
      padding: '9.5px',
    },
  },
  paper: {
    padding: '2rem',
    width: '70%',
    [theme.breakpoints.up('xs')]: {
      width: '90%',
    },
    [theme.breakpoints.up('sm')]: {
      width: '70%',
    },
  },
  darkIcon: {
    '& > *': {
      fill: 'black',
    },
  },
  cardShadow: {
    boxShadow: ` 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);`,
  },
  userIcon: {
    'fontSize': `${theme.spacing(8)}px`,
    'textAnchor': 'middle',
    'dominantBaseline': 'middle',
    '& > *': {
      fill: `${theme.palette.blue.main}`,
    },
  },
  smallText: {
    fontSize: '0.8rem',
  },
}))

export function useTheming() {
  const classes = useStyles()

  return classes
}
