import React, { useState, useEffect } from 'react'

/** Data */
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AppState } from 'App/reducers'
import { setOpen, setFixed } from 'Data/Sidebar'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MenuIcon from '@material-ui/icons/Menu'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import HelpIcon from '@material-ui/icons/Help'

import SecurityIcon from '@material-ui/icons/Security'
import SettingsIcon from '@material-ui/icons/Settings'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'
import BusinessIcon from '@material-ui/icons/Business'
import ContactsIcon from '@material-ui/icons/Contacts'
import useTheme from '@material-ui/core/styles/useTheme'
import useMediaQuery from '@material-ui/core/useMediaQuery'

/** UI */
import { Clamp } from 'UI'
import { Notifications } from 'Notification/Notifications'
import { ReactComponent as PersonIcon } from 'Image/user.svg'

/** Helpers */
import {
  useIsMounted,
  USER_OVERVIEW_URL,
  LOGOUT_URL,
  USER_PREFERENCES_URL,
  USER_SECURITY_URL,
  USER_PERSONAL_INFO_URL,
  SWITCH_ACCOUNTS_URL,
} from 'Lib'

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
  companyName: {
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
}))

export function UserHeader() {
  const { setSafely } = useIsMounted()
  const history = useHistory()
  const classes = useStyles()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isXsWidth = useMediaQuery(theme.breakpoints.down('xs'))
  const isSmWidth = useMediaQuery(theme.breakpoints.down('sm'))
  const user = useSelector((state: AppState) => state.user)
  const open = useSelector((state: AppState) => state.sidebar.open)
  const fixed = useSelector((state: AppState) => state.sidebar.fixed)
  const hasMultipleCompanies = useSelector((state: AppState) => state.company.has_multiple)
  const companyName = useSelector((state: AppState) => state.company.name) ?? ''
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)

  useEffect(() => {
    dispatch(setFixed(false))
  }, [isXsWidth, dispatch])

  const onDesktopOpen = () => {
    dispatch(setFixed(true))
    dispatch(setOpen(true))
  }

  const onDesktopClose = () => {
    dispatch(setFixed(false))
    dispatch(setOpen(false))
  }

  const onMobileOpen = () => {
    dispatch(setOpen(true))
  }

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

  const DesktopHamburger = () => {
    return (
      <>
        {open && fixed ? (
          <Button className={classes.menuButton} onClick={onDesktopClose}>
            <MoreVertIcon className={classes.toggle} />
          </Button>
        ) : (
          <Button className={classes.menuButton} onClick={onDesktopOpen}>
            <MenuIcon className={classes.toggle} />
          </Button>
        )}
      </>
    )
  }

  const MobileHamburger = () => {
    return (
      <>
        <Button className={classes.menuButton} onClick={onMobileOpen}>
          <MenuIcon className={classes.toggle} />
        </Button>
      </>
    )
  }

  return (
    <>
      <Grid container justify="space-between" alignItems="center" className={classes.root}>
        <Grid container item xs={4} justify="flex-start" alignContent="center" alignItems="center">
          <Grid item>{isSmWidth ? <MobileHamburger /> : <DesktopHamburger />}</Grid>
          <Grid item>
            {!isSmWidth && (
              <Typography className={classes.companyName}>
                <Clamp val={companyName} lim={40} />
              </Typography>
            )}
          </Grid>
        </Grid>

        <Grid item xs={8}>
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
