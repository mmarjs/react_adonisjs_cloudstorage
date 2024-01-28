import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'
import makeStyles from '@material-ui/core/styles/makeStyles'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import StoreIcon from '@material-ui/icons/Store'
import DashboardIcon from '@material-ui/icons/Dashboard'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import HistoryIcon from '@material-ui/icons/History'
import PhotoSizeSelectLargeIcon from '@material-ui/icons/PhotoSizeSelectLarge'
import PaymentIcon from '@material-ui/icons/Payment'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import {
  ENTERPRISE_MANAGE_USERS_URL,
  ENTERPRISE_DASHBOARD_URL,
  ENTERPRISE_ACCOUNT_OWNERS_URL,
  ENTERPRISE_BILLING_URL,
  ENTERPRISE_CUSTOMIZE_URL,
  ENTERPRISE_ACTIVITY_HISTORY_URL,
  ENTERPRISE_CASE_MANAGEMENT_URL,
} from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  primaryIcon: {
    color: '#3B3838',
    margin: '0 0 0 8px',
  },
  primaryText: {
    fontSize: '0.9rem',
  },
  itemIcon: {
    color: '#767171',
    margin: '0 0 0 8px',
  },
  itemText: {
    fontStyle: 'italic',
    fontSize: '0.9rem',
  },
  divider: {
    height: '2px',
  },
}))

export function EnterpriseUserMenu() {
  const classes = useStyles()
  const [listOpen, setListOpen] = useState(false)

  const handleClick = () => {
    setListOpen(!listOpen)
  }

  return (
    <List component="nav" className={classes.root}>
      <Divider className={classes.divider} />
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <StoreIcon className={classes.primaryIcon} />
        </ListItemIcon>
        <ListItemText primary="Enterprise" />
        {listOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={listOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem component={Link} to={ENTERPRISE_DASHBOARD_URL}>
            <ListItemIcon>
              <DashboardIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Main Dashboard" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ENTERPRISE_ACCOUNT_OWNERS_URL}>
            <ListItemIcon>
              <AccountTreeIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Account Owners" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ENTERPRISE_MANAGE_USERS_URL}>
            <ListItemIcon>
              <SupervisorAccountIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="User Management" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ENTERPRISE_CASE_MANAGEMENT_URL}>
            <ListItemIcon>
              <MenuBookIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Case Management" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ENTERPRISE_ACTIVITY_HISTORY_URL}>
            <ListItemIcon>
              <HistoryIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Case Activities" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ENTERPRISE_CUSTOMIZE_URL}>
            <ListItemIcon>
              <PhotoSizeSelectLargeIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Customize" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ENTERPRISE_BILLING_URL}>
            <ListItemIcon>
              <PaymentIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Billing Info" className={classes.itemText} />
          </ListItem>
        </List>
      </Collapse>
    </List>
  )
}
