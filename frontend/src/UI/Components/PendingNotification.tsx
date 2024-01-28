import React from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import CircularProgress from '@material-ui/core/CircularProgress'
import DoneIcon from '@material-ui/icons/Done'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    bottom: '10px',
    width: '100%',
    zIndex: 1000,
  },
  text: {
    marginLeft: '10px',
  },
  textContainer: {
    padding: '5px 10px 5px 10px',
    width: '50%',
    backgroundColor: '#cecccc',
    borderRadius: '5px',
  },
  done: {
    color: '#5fb158',
  },
}))
export function PendingNotification() {
  const classes = useStyles()
  const pending = useSelector((state: AppState) => state.workspaceData.pendingNotification)

  return (
    <>
      {pending?.isPending && (
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className={classes.root}
        >
          <Grid container alignItems="center" className={classes.textContainer}>
            {pending?.isDone ? (
              <DoneIcon className={classes.done} />
            ) : (
              <CircularProgress size="20px" />
            )}
            <span className={classes.text}>{pending.pendingText}</span>
          </Grid>
        </Grid>
      )}
    </>
  )
}
