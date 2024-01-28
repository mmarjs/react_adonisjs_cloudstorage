import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Typography from '@material-ui/core/Typography'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import SecurityIcon from '@material-ui/icons/Security'
import ListAltIcon from '@material-ui/icons/ListAlt'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'
import InfoIcon from '@material-ui/icons/Info'
import { USER_PREFERENCES_URL, USER_SECURITY_URL, USER_PERSONAL_INFO_URL } from 'Lib'

interface Props {
  card: 'info' | 'security' | 'preferences' | 'account_info'
}
const useStyles = makeStyles((theme) => ({
  root: {
    'minWidth': 250,
    '& :hover': {
      cursor: 'pointer',
    },
  },
  iconRow: {
    margin: `0 0 ${theme.spacing(3)}px 0`,
  },
  link: {
    margin: '1rem 0',
  },
  infoIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#4c5964`,
    },
  },
  preferencesIcon: {
    'fontSize': `${theme.spacing(8)}px`,
    'textAnchor': 'middle',
    'dominantBaseline': 'middle',
    '& > *': {
      fill: `#075e64`,
    },
  },
  securityIcon: {
    'fontSize': `${theme.spacing(8)}px`,
    'textAnchor': 'middle',
    'dominantBaseline': 'middle',
    '& > *': {
      fill: `#004586`,
    },
  },
  accountInfoIcon: {
    'fontSize': `${theme.spacing(8)}px`,
    'textAnchor': 'middle',
    'dominantBaseline': 'middle',
    '& > *': {
      fill: `#53638f`,
    },
  },
}))

export function ProfileCard(props: Props) {
  const { card } = props
  const classes = useStyles()
  const history = useHistory()

  const link = (): string => {
    if (card === 'info') {
      return USER_PERSONAL_INFO_URL
    }
    if (card === 'security') {
      return USER_SECURITY_URL
    }

    return USER_PREFERENCES_URL
  }

  const linkText = (): string => {
    if (card === 'info') {
      return 'Manage Personal Info'
    }
    if (card === 'security') {
      return 'Manage Sign In'
    }
    if (card === 'account_info') {
      return 'Manage Account Info'
    }

    return 'Manage Preferences'
  }

  const title = (): string => {
    if (card === 'info') {
      return 'Personal Info'
    }

    if (card === 'security') {
      return 'Sign In & Security'
    }

    if (card === 'account_info') {
      return 'Account Info'
    }

    return 'Preferences'
  }

  const desc = (): string => {
    if (card === 'info') {
      return 'Update your name, email, phone, and address'
    }

    if (card === 'security') {
      return 'Update your password'
    }

    if (card === 'account_info') {
      return 'Manage account name and status'
    }

    return 'Update your notification settings'
  }

  return (
    <>
      <Card className={classes.root} onClick={() => history.push(link())}>
        <CardContent>
          <Grid container justify="center">
            <Grid container item sm={4} xs={12} justify="center" className={classes.iconRow}>
              <Grid item>
                {card === 'info' && <ContactPhoneIcon className={classes.infoIcon} />}
                {card === 'preferences' && <ListAltIcon className={classes.preferencesIcon} />}
                {card === 'security' && <SecurityIcon className={classes.securityIcon} />}
                {card === 'account_info' && <InfoIcon className={classes.accountInfoIcon} />}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography align="center">
                <strong>{title()}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography align="center">{desc()}</Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid container justify="center">
            <Grid item sm={6} xs={12}>
              <Typography align="center" className={classes.link}>
                <Link to={link()}>{linkText()}</Link>
              </Typography>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </>
  )
}
