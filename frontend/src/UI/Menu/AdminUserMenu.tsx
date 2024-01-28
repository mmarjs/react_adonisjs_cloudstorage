import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'
import makeStyles from '@material-ui/core/styles/makeStyles'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import HistoryIcon from '@material-ui/icons/History'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { ACCOUNT_MANAGE_USERS_URL, ACCOUNT_ACTIVITY_HISTORY_URL, ACCOUNT_BILLING_URL } from 'Lib'

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

export function AdminUserMenu() {
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
          <AccountBoxIcon className={classes.primaryIcon} />
        </ListItemIcon>
        <ListItemText primary="Admin Center" />
        {listOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={listOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem component={Link} to={ACCOUNT_MANAGE_USERS_URL}>
            <ListItemIcon>
              <SupervisorAccountIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Manage Users" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ACCOUNT_ACTIVITY_HISTORY_URL}>
            <ListItemIcon>
              <HistoryIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Activity History" className={classes.itemText} />
          </ListItem>
          <ListItem component={Link} to={ACCOUNT_BILLING_URL}>
            <ListItemIcon>
              <CreditCardIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Billing Info" className={classes.itemText} />
          </ListItem>
        </List>
      </Collapse>
    </List>
  )
}
