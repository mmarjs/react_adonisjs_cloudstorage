import React from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SecurityIcon from '@material-ui/icons/Security'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import { USER_EMAIL_FORM_URL, USER_PASSWORD_FORM_URL, USER_TWO_FACTOR_FORM_URL } from 'Lib'
import { Template, IconTitle } from 'UI'

const useStyles = makeStyles((theme) => ({
  container: {
    padding: `0 0 ${theme.spacing(4)}px 0`,
  },
  row: {
    margin: `${theme.spacing(3)}px 0`,
  },
  icon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#b98f04`,
    },
  },
  title: {
    fontSize: '2rem',
    margin: `0 0 ${theme.spacing(8)}px 0`,
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

export function Security() {
  const classes = useStyles()
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)

  const Title = () => (
    <IconTitle Icon={() => <SecurityIcon className={classes.icon} />} text="Security & Sign In" />
  )

  const twoFactorRequired = user.is_two_factor_required === true ? 'Required' : 'Not Required'

  return (
    <Template title="Security" TitleComponent={Title}>
      <Grid container justify="center" alignContent="center">
        <Grid item sm={6} xs={12} component={Paper}>
          <List dense className={classes.list}>
            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>Email:</strong>
                </Typography>
                <Typography display="inline">{user.email}</Typography>
              </ListItemText>
              <ListItemSecondaryAction onClick={() => history.push(USER_EMAIL_FORM_URL)}>
                <ChevronRightIcon />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>Password:</strong>
                </Typography>
                <Typography display="inline">Reset Your Password</Typography>
              </ListItemText>
              <ListItemSecondaryAction onClick={() => history.push(USER_PASSWORD_FORM_URL)}>
                <ChevronRightIcon />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem className={classes.listItem}>
              <ListItemText>
                <Typography display="inline" className={classes.field}>
                  <strong>2 Factor Auth:</strong>
                </Typography>

                <Typography display="inline">{twoFactorRequired}</Typography>
              </ListItemText>

              <ListItemSecondaryAction onClick={() => history.push(USER_TWO_FACTOR_FORM_URL)}>
                <ChevronRightIcon />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Template>
  )
}
