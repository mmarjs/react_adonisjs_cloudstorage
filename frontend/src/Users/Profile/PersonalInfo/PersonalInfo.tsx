import React from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import { isEmpty } from 'lodash-es'
import { formatAddress, USER_NAME_FORM_URL, USER_PHONE_FORM_URL, USER_ADDRESS_FORM_URL } from 'Lib'
import { Template, IconTitle } from 'UI'

const useStyles = makeStyles((theme) => ({
  container: {
    padding: `0 0 ${theme.spacing(4)}px 0`,
  },
  row: {
    margin: `${theme.spacing(3)}px 0`,
  },
  infoIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#4c5964`,
    },
  },

  section: {},
  list: {
    border: '1px solid #c0c0c0',
  },
  listItem: {
    padding: '1rem',
  },
  field: {
    margin: '0 1.5rem 0 0',
  },
}))

export function PersonalInfo() {
  const classes = useStyles()
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)
  const company = useSelector((state: AppState) => state.company)

  const Title = () => (
    <IconTitle
      Icon={() => <ContactPhoneIcon className={classes.infoIcon} />}
      text="Personal Info"
    />
  )

  return (
    <Template title="Personal Info" TitleComponent={Title}>
      <Grid container justify="center" alignContent="center">
        <Grid item sm={6} xs={12} component={Paper}>
          <List dense className={classes.list}>
            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>Name:</strong>
                </Typography>
                <Typography display="inline">
                  {user.first_name} {user.last_name}
                </Typography>
              </ListItemText>
              <ListItemSecondaryAction onClick={() => history.push(USER_NAME_FORM_URL)}>
                <ChevronRightIcon />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>Phone:</strong>
                </Typography>
                {isEmpty(user?.phone) ? (
                  <Typography display="inline">Add your phone number</Typography>
                ) : (
                  <Typography display="inline">{user.phone}</Typography>
                )}
              </ListItemText>
              <ListItemSecondaryAction onClick={() => history.push(USER_PHONE_FORM_URL)}>
                <ChevronRightIcon />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>Address:</strong>
                </Typography>
                <Typography display="inline">{formatAddress(user)}</Typography>
              </ListItemText>
              <ListItemSecondaryAction onClick={() => history.push(USER_ADDRESS_FORM_URL)}>
                <ChevronRightIcon />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" color="primary" className={classes.field}>
                  <strong>Account Name:</strong>
                </Typography>

                <Typography display="inline" color="primary">
                  {company.name}
                </Typography>
              </ListItemText>
            </ListItem>

            <Divider />

            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>Company Name:</strong>
                </Typography>
                <Typography display="inline">{user?.company_name}</Typography>
              </ListItemText>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Template>
  )
}
