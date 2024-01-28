import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AppState } from 'App/reducers'
import { setFixed } from 'Data/Sidebar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import HelpIcon from '@material-ui/icons/Help'
import { ReactComponent as PersonIcon } from 'Image/user.svg'
import SecurityIcon from '@material-ui/icons/Security'
import SettingsIcon from '@material-ui/icons/Settings'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'
import ContactsIcon from '@material-ui/icons/Contacts'
import BusinessIcon from '@material-ui/icons/Business'
import useTheme from '@material-ui/core/styles/useTheme'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { Notifications } from 'Notification/Notifications'
import {
  useIsMounted,
  USER_OVERVIEW_URL,
  LOGOUT_URL,
  USER_PREFERENCES_URL,
  USER_SECURITY_URL,
  USER_PERSONAL_INFO_URL,
  HOME_URL,
  SWITCH_ACCOUNTS_URL,
} from 'Lib'
import HalfLogo from 'Image/logo-half.png'
import EvidenceLockerIcon from 'Image/evidence_locker.svg'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '4rem',
  },
  userbox: {
    padding: '0 2rem 0 0',
  },
  username: {
    color: '#ffffff',
  },
  toggle: {
    flexGrow: 1,
  },
  icon: {
    color: '#000000',
    height: '1.9rem',
    margin: '18px 0 0 0',
  },
  menuButton: {
    color: `${theme.palette.intermediate.main}`,
  },
  logo: {
    backgroundColor: '#fff',
    height: '100%',
  },
  logoContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    objectFit: 'cover',
    height: '4rem',
  },
  evidenceIcon: {
    fontSize: '1.7rem',
    maxHeight: '3rem',
    cursor: 'pointer',
  },
  evidenceLogo: {
    maxHeight: '3.3rem',
    marginTop: '5px',
    cursor: 'pointer',
  },
}))

export function ViewerHeader() {
  const { setSafely } = useIsMounted()
  const history = useHistory()
  const classes = useStyles()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isXsWidth = useMediaQuery(theme.breakpoints.down('xs'))
  const user = useSelector((state: AppState) => state.user)
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const hasMultipleCompanies = useSelector((state: AppState) => state.company.has_multiple)

  useEffect(() => {
    dispatch(setFixed(false))
  }, [isXsWidth, dispatch])

  const onUserMenuClick = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }

  const closeUserMenu = () => {
    setSafely(setAnchorEl, null)
  }

  const navigate = (url: string) => {
    history.push(url)
    setSafely(setAnchorEl, null)
  }

  const goToMainpage = () => {
    history.push(HOME_URL)
  }

  return (
    <>
      <Grid container justify="space-between" alignItems="center" className={classes.root}>
        <Grid item xs={2} className={classes.logo}>
          <Grid container item xs={12} className={classes.logoContainer}>
            <Grid container item alignItems="center" justify="center">
              <img
                src={EvidenceLockerIcon}
                alt="logo-icon"
                className={classes.evidenceIcon}
                onClick={() => goToMainpage()}
              />
              <img
                src={HalfLogo}
                alt="evidence locker logo"
                className={classes.evidenceLogo}
                onClick={() => goToMainpage()}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={10}>
          <Grid
            container
            item
            xs={12}
            justify="flex-end"
            alignContent="center"
            alignItems="center"
            className={classes.userbox}
            spacing={4}
          >
            <Grid item>
              {isXsWidth ? (
                <PersonIcon className={classes.icon} onClick={onUserMenuClick} />
              ) : (
                <PersonIcon
                  className={classes.icon}
                  onMouseEnter={(e) => {
                    setSafely(setAnchorEl, e.currentTarget)
                  }}
                />
              )}

              <Menu
                id="user-header-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={closeUserMenu}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <div onClick={() => navigate(USER_OVERVIEW_URL)}>
                  <MenuItem>
                    <ListItemIcon>
                      <ContactsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Overview" />
                  </MenuItem>
                </div>

                <div onClick={() => navigate(USER_PERSONAL_INFO_URL)}>
                  <MenuItem>
                    <ListItemIcon>
                      <ContactPhoneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Personal Info" />
                  </MenuItem>
                </div>

                <div onClick={() => navigate(USER_SECURITY_URL)}>
                  <MenuItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText primary="Security & Sign In" />
                  </MenuItem>
                </div>

                <div onClick={() => navigate(USER_PREFERENCES_URL)}>
                  <MenuItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Preferences" />
                  </MenuItem>
                </div>

                {hasMultipleCompanies && (
                  <MenuItem onClick={() => navigate(SWITCH_ACCOUNTS_URL)}>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText primary="Switch Accounts" />
                  </MenuItem>
                )}

                <div onClick={() => navigate(LOGOUT_URL)}>
                  <MenuItem>
                    <ListItemIcon>
                      <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Log off" />
                  </MenuItem>
                </div>
              </Menu>
            </Grid>
            <Grid item>
              <Typography className={classes.username}>
                <em>Welcome!</em> <br /> {user.first_name} {user.last_name}
              </Typography>
            </Grid>
            <Grid item>
              <Notifications />
            </Grid>
            <Grid item>
              <HelpIcon className={classes.icon} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
