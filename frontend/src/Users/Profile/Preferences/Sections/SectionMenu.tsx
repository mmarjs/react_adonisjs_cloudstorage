import { useContext } from 'react'

/** Data */
import { PreferencesContext } from 'Users/Profile/Preferences/PreferencesProvider'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** Helpers */
import clsx from 'clsx'

type Section = 'account-info' | 'notification-settings' | 'preferences'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '1rem',
  },
  regular: {
    fontSize: '1.1rem',
    fontWeight: 'normal',
    margin: '0 0 1rem 0',
  },
  bold: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
  },
}))

export function SectionMenu() {
  const classes = useStyles()
  const { container: data, role } = useContext(PreferencesContext)
  const section = data.section
  const admins = ['account-owner', 'account-admin']

  const setSection = (section: Section) => {
    data.section = section
  }

  return (
    <Grid container className={classes.root} justify="center">
      <Grid container justify="center" alignContent="center">
        {admins.includes(role) && (
          <Grid item xs={12}>
            <Typography
              className={clsx({
                [classes.regular]: section !== 'account-info',
                [classes.bold]: section === 'account-info',
              })}
            >
              <div onClick={() => setSection('account-info')}>Account Info</div>
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography
            className={clsx({
              [classes.regular]: section !== 'notification-settings',
              [classes.bold]: section === 'notification-settings',
            })}
          >
            <div onClick={() => setSection('notification-settings')}>Notifications</div>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            className={clsx({
              [classes.regular]: section !== 'preferences',
              [classes.bold]: section === 'preferences',
            })}
          >
            <div onClick={() => setSection('preferences')}>More Settings</div>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}
