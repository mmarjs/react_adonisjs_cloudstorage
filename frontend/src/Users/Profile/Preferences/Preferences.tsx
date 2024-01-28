import { useContext, useEffect } from 'react'

/** Data*/
import { useDispatch } from 'react-redux'
import { setNotificationSettings } from 'Data/NotificationSettings'
import { StatusContext, StatusStore } from 'App/StatusProvider'
import PreferencesProvider from './PreferencesProvider'
import { PreferencesContext } from './PreferencesProvider'

/** Material UI */
import Paper from '@material-ui/core/Paper'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ListAltIcon from '@material-ui/icons/ListAlt'

/** UI */
import { SectionMenu, AccountInfo, MoreSettings, Notifications } from './Sections'
import { primary } from 'App/theme'

/** Helpers */
import { Template, IconTitle } from 'UI'

const useStyles = makeStyles((theme) => ({
  row: {
    margin: `${theme.spacing(3)}px 0`,
  },
  preferencesIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#075e64`,
    },
  },
  paper: {
    'minHeight': '70vh',
    'width': '100%',
    'boxShadow': 'none',
    'overflow': 'auto',
    'borderRadius': '25px',
    '&::-webkit-scrollbar-track': {
      borderRadius: '10px',
      backgroundColor: '#dbefda',
    },
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px',
      backgroundColor: '#F5F5F5',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '10px',
      backgroundColor: '#5FB158',
    },
  },
  container: {
    'display': 'grid',
    'minHeight': '70vh',
    'grid-template-columns': '250px 1fr',
    'grid-template-rows': '1fr',
    'grid-auto-columns': '1fr',
    'grid-auto-rows': '1fr',
    'gap': '0px 0px',
    'grid-auto-flow': 'row',
    'grid-template-areas': `
      "sections preferences"
      `,
  },
  sections: {
    'grid-area': 'sections',
    'border-right': `1px solid ${primary}`,
  },
  preferences: {
    'grid-area': 'preferences',
    'overflow': 'scroll',
  },
}))

export function Preferences() {
  return (
    <PreferencesProvider>
      <PreferencesPage />
    </PreferencesProvider>
  )
}

export function PreferencesPage() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { showStatus } = useContext(StatusContext) as StatusStore
  const { container: data, role } = useContext(PreferencesContext)

  useEffect(() => {
    data
      .loadNotificationSettings()
      .then(() => {
        dispatch(setNotificationSettings(data.settings))
      })
      .catch(() => {
        showStatus(data.errorMessage, 'error')
      })
    data
      .loadPreferences()
      .then(() => {})
      .catch(() => {
        showStatus(data.errorMessage, 'error')
      })
  }, [])

  const section = data.section
  const admins = ['account-owner', 'account-admin']

  const Title = () => (
    <IconTitle
      Icon={() => <ListAltIcon className={classes.preferencesIcon} />}
      text="Preferences"
    />
  )

  return (
    <Template
      title="Preferences"
      TitleComponent={Title}
      isLoading={data.isLoading}
      isError={data.isError}
      errorMessage={data.errorMessage}
    >
      <Paper className={classes.paper}>
        <div className={classes.container}>
          <div className={classes.sections}>
            <SectionMenu />
          </div>
          <div className={classes.preferences}>
            {admins.includes(role) && section === 'account-info' && <AccountInfo />}
            {section === 'notification-settings' && <Notifications />}
            {section === 'preferences' && <MoreSettings />}
          </div>
        </div>
      </Paper>
    </Template>
  )
}
