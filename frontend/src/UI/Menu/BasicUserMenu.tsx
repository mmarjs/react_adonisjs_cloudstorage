import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import PersonIcon from '@material-ui/icons/Person'
import DashboardIcon from '@material-ui/icons/Dashboard'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'
import SecurityIcon from '@material-ui/icons/Security'
import SettingsIcon from '@material-ui/icons/Settings'
import ContactMailIcon from '@material-ui/icons/ContactMail'
import VisibilityIcon from '@material-ui/icons/Visibility'
import BusinessIcon from '@material-ui/icons/Business'

import {
  USER_OVERVIEW_URL,
  MANAGE_CASES_URL,
  HOME_URL,
  USER_PREFERENCES_URL,
  USER_SECURITY_URL,
  USER_PERSONAL_INFO_URL,
  SWITCH_ACCOUNTS_URL,
} from 'Lib'

const useStyles = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(3),
  },
  welcome: {
    color: theme.palette.primary.main,
  },
  spacing: {
    padding: '36.55px 0 0 0',
  },
  primaryMenuIcon: {
    color: '#3B3838',
    margin: '0 0 0 8px',
  },
  primaryText: {
    fontSize: '1rem',
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
export function BasicUserMenu() {
  const classes = useStyles()
  const [listOpen, setListOpen] = useState(false)

  const handleClick = () => {
    setListOpen(!listOpen)
  }

  const { first_name, last_name } = useSelector((state: AppState) => state.user)
  const hasMultipleCompanies = useSelector((state: AppState) => state.company.has_multiple)

  return (
    <>
      <div className={classes.spacing} />
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <PersonIcon className={classes.primaryMenuIcon} />
        </ListItemIcon>
        <ListItemText className={classes.primaryText}>
          <strong>
            <em className={classes.welcome}>Welcome!</em>
          </strong>{' '}
          <br />{' '}
          <strong>
            {first_name} {last_name}
          </strong>
        </ListItemText>
        {listOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={listOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem component={Link} to={USER_OVERVIEW_URL}>
            <ListItemIcon>
              <VisibilityIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Profile Overview" className={classes.itemText} />
          </ListItem>

          <ListItem component={Link} to={USER_PERSONAL_INFO_URL}>
            <ListItemIcon>
              <ContactMailIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Personal Info" className={classes.itemText} />
          </ListItem>

          <ListItem component={Link} to={USER_SECURITY_URL}>
            <ListItemIcon>
              <SecurityIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Security & Sign In" className={classes.itemText} />
          </ListItem>

          <ListItem component={Link} to={USER_PREFERENCES_URL}>
            <ListItemIcon>
              <SettingsIcon className={classes.itemIcon} />
            </ListItemIcon>
            <ListItemText primary="Preferences" className={classes.itemText} />
          </ListItem>

          {hasMultipleCompanies && (
            <ListItem component={Link} to={SWITCH_ACCOUNTS_URL}>
              <ListItemIcon>
                <BusinessIcon className={classes.itemIcon} />
              </ListItemIcon>
              <ListItemText primary="Switch Accounts" className={classes.itemText} />
            </ListItem>
          )}
        </List>
      </Collapse>

      <Divider className={classes.divider} />

      <ListItem component={Link} to={HOME_URL}>
        <ListItemIcon>
          <DashboardIcon className={classes.primaryMenuIcon} />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>

      <ListItem component={Link} to={MANAGE_CASES_URL}>
        <ListItemIcon>
          <BusinessCenterIcon className={classes.primaryMenuIcon} />
        </ListItemIcon>
        <ListItemText primary="Manage Cases" />
      </ListItem>
    </>
  )
}
