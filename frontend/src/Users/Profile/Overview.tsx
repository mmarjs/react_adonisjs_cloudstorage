import React from 'react'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import { ProfileCard } from './ProfileCard'
import { Template, IconTitle } from 'UI'

const useStyles = makeStyles((theme) => ({
  container: {
    padding: `0 0 ${theme.spacing(4)}px 0`,
  },
  userIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `${theme.palette.blue.main}`,
    },
  },
  hello: {
    fontSize: '2rem',
    margin: `0 0 ${theme.spacing(8)}px 0`,
  },
}))

export function Overview() {
  const classes = useStyles()

  const Title = () => (
    <IconTitle
      Icon={() => <AccountCircleIcon className={classes.userIcon} />}
      text="Profile Overview"
    />
  )

  return (
    <Template title="Profile" TitleComponent={Title}>
      <Grid container justify="center" alignContent="center">
        <Grid container item sm={6} xs={12} justify="center" alignContent="center" spacing={4}>
          <Grid item sm={9} xs={12}>
            <ProfileCard card="info" />
          </Grid>

          <Grid item sm={9} xs={12}>
            <ProfileCard card="security" />
          </Grid>

          <Grid item sm={9} xs={12}>
            <ProfileCard card="preferences" />
          </Grid>
        </Grid>
      </Grid>
    </Template>
  )
}
