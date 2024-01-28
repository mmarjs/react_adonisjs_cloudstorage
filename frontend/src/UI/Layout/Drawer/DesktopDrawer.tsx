import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from 'App/reducers'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Drawer from '@material-ui/core/Drawer'
import { setOpen } from 'Data/Sidebar'
import clsx from 'clsx'
import { CombinedMenu } from 'UI/Menu'

export function DesktopDrawer() {
  const dispatch = useDispatch()
  const loggedIn = useSelector((state: AppState) => state.auth.loggedIn)
  const open = useSelector((state: AppState) => state.sidebar.open)
  const fixed = useSelector((state: AppState) => state.sidebar.fixed)
  const user = useSelector((state: AppState) => state.user)
  const company = useSelector((state: AppState) => state.company)
  const showAdminMenu = ['super-admin', 'account-owner', 'account-admin'].includes(user.role)
  const showEnterpriseMenu = user.role === 'account-owner' && Boolean(company.is_enterprise)

  const useStyles = makeStyles((theme) => ({
    drawer: {
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: '240px',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      'width': '73px',
      'transition': theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      'overflowX': 'hidden',
      'overflowY': 'auto',
      '&::-webkit-scrollbar-track': {
        borderRadius: '10px',
        backgroundColor: '#dbefda',
      },
      '&::-webkit-scrollbar': {
        width: '7px',
        backgroundColor: '#F5F5F5',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '10px',
        backgroundColor: '#5FB158',
      },
    },
  }))

  const classes = useStyles()

  const onMouseEnter = () => {
    if (!fixed && !open) {
      dispatch(setOpen(true))
    }
  }

  const onMouseLeave = () => {
    if (!fixed && open) {
      dispatch(setOpen(false))
    }
  }

  if (!loggedIn) {
    return <></>
  }

  return (
    <>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <CombinedMenu showAdminMenu={showAdminMenu} showEnterpriseMenu={showEnterpriseMenu} />
      </Drawer>
    </>
  )
}
