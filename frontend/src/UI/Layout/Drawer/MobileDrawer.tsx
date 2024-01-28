import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOpen } from 'Data/Sidebar'
import { AppState } from 'App/reducers'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Drawer from '@material-ui/core/Drawer'
import { CombinedMenu } from 'UI/Menu'

export function MobileDrawer() {
  const dispatch = useDispatch()
  const loggedIn = useSelector((state: AppState) => state.auth.loggedIn)
  const open = useSelector((state: AppState) => state.sidebar.open)
  const user = useSelector((state: AppState) => state.user)
  const company = useSelector((state: AppState) => state.company)
  const showAdminMenu = ['super-admin', 'account-owner', 'account-admin'].includes(user.role)
  const showEnterpriseMenu = user.role === 'account-owner' && Boolean(company.is_enterprise)

  const useStyles = makeStyles((theme) => ({
    drawer: {
      flexShrink: 0,
      whiteSpace: 'nowrap',
      width: '240px',
    },
  }))

  const classes = useStyles()

  const onMobileClose = () => {
    dispatch(setOpen(false))
  }

  if (!loggedIn) {
    return <></>
  }

  return (
    <>
      <Drawer
        variant="temporary"
        className={classes.drawer}
        open={open}
        onEscapeKeyDown={onMobileClose}
        onBackdropClick={onMobileClose}
      >
        <CombinedMenu showAdminMenu={showAdminMenu} showEnterpriseMenu={showEnterpriseMenu} />
      </Drawer>
    </>
  )
}
