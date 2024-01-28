import React from 'react'
import { HOME_URL } from 'Lib'
import EvidenceLockerIcon from 'Image/evidence_locker.svg'
import { AdminUserMenu, BasicUserMenu, EnterpriseUserMenu } from 'UI/Menu'
import HalfLogo from 'Image/logo-half.png'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Link } from 'react-router-dom'
import { CombinedMenuProps } from 'types'

const useStyles = makeStyles((theme) => ({
  drawerContainer: {
    // overflow: 'auto',
  },
  evidenceIcon: {
    fontSize: '1.7rem',
    maxHeight: '3rem',
    margin: '0 0 14px 0',
  },
  evidenceLogo: {
    maxHeight: '3.3rem',
  },
}))

export function CombinedMenu(props: CombinedMenuProps) {
  const { showAdminMenu, showEnterpriseMenu } = props
  const classes = useStyles()

  return (
    <div className={classes.drawerContainer}>
      <List component="nav">
        <ListItem component={Link} to={HOME_URL} style={{ paddingLeft: 11 }}>
          <ListItemIcon>
            <img src={EvidenceLockerIcon} alt="logo-icon" className={classes.evidenceIcon} />
          </ListItemIcon>
          <ListItemText>
            <img src={HalfLogo} alt="evidence locker logo" className={classes.evidenceLogo} />
          </ListItemText>
        </ListItem>
        <BasicUserMenu />
      </List>

      {showAdminMenu && <AdminUserMenu />}

      {showEnterpriseMenu && <EnterpriseUserMenu />}
    </div>
  )
}
