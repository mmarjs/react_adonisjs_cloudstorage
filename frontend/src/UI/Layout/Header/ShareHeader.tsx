import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import logo from 'Image/logo.png'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useHistory } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { AppState } from 'App/reducers'
import { HOME_URL, SHARE_LOGIN_URL, SHARE_USER_PASSWORD_FORM_URL, useIsMounted } from 'Lib'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { ReactComponent as PersonIcon } from 'Image/user.svg'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import NotificationsIcon from '@material-ui/icons/Notifications'
import HelpIcon from '@material-ui/icons/Help'
import SecurityIcon from '@material-ui/icons/Security'

const useStyles = makeStyles((theme) => ({
  img: {
    objectFit: 'cover',
    height: '4rem',
    backgroundColor: '#fff',
  },
  userbox: {
    padding: '0 2rem 0 0',
  },
  icon: {
    color: '#000000',
    height: '1.9rem',
    margin: '18px 0 0 0',
  },
  username: {
    color: '#ffffff',
  },
}))

export function ShareHeader() {
  const { setSafely } = useIsMounted()
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const shareLink = useSelector((state: AppState) => state.share.shareLink)

  const closeUserMenu = () => {
    setSafely(setAnchorEl, null)
  }

  const navigate = (url: string) => {
    history.push(url)
    setSafely(setAnchorEl, null)
  }

  const logOut = () => {
    const link = shareLink.link
    dispatch({ type: 'RESET' })
    navigate(SHARE_LOGIN_URL + `/${link}`)
  }

  const resetPassword = () => {
    history.push(SHARE_USER_PASSWORD_FORM_URL)
    setSafely(setAnchorEl, null)
  }

  return (
    <Box m={0} style={{ height: '4rem', display: 'flex' }}>
      <Link to={HOME_URL}>
        <img src={logo} alt={'logo'} className={classes.img} />
      </Link>
      <Grid item xs={11}>
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
            <PersonIcon
              className={classes.icon}
              onMouseEnter={(e) => {
                setSafely(setAnchorEl, e.currentTarget)
              }}
            />
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
              <div onClick={logOut}>
                <MenuItem>
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log off" />
                </MenuItem>
              </div>
              {shareLink.can_update_password ? (
                <div onClick={resetPassword}>
                  <MenuItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reset Password" />
                  </MenuItem>
                </div>
              ) : (
                <></>
              )}
            </Menu>
          </Grid>
          <Grid item>
            <Typography className={classes.username}>
              <em>Welcome!</em> <br /> {shareLink?.first_name} {shareLink?.last_name}
            </Typography>
          </Grid>
          <Grid item>
            <NotificationsIcon className={classes.icon} />
          </Grid>
          <Grid item>
            <HelpIcon className={classes.icon} />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
