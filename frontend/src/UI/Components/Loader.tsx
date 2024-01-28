import React from 'react'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: '70vh',
    width: '100vw',
  },
}))
export function Loader() {
  const classes = useStyles()

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      className={classes.wrapper}
    >
      <Grid item>
        <CircularProgress size={60} color="primary" />
      </Grid>
    </Grid>
  )
}
