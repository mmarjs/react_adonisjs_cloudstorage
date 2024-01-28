import React from 'react'
import { Helmet } from 'react-helmet-async'
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import Container from '@material-ui/core/Container'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { APP_NAME, useBreakpoints } from 'Lib'
import { DesktopCheckProps } from 'types'

const useStyles = makeStyles(() => ({
  alertRow: {
    margin: '2rem 0',
  },
}))

export function DesktopCheck(props: DesktopCheckProps) {
  const { title } = props
  const classes = useStyles()
  const { md } = useBreakpoints()

  if (md) {
    return (
      <>
        <Helmet>
          <title>
            {title} | {APP_NAME}
          </title>
        </Helmet>
        <Container>
          <Grid container justify="center" alignItems="center" className={classes.alertRow}>
            <Grid item sm={9} xs={12}>
              <Alert severity="info">
                For a better experience, please continue on a desktop or laptop computer.
              </Alert>
            </Grid>
          </Grid>
        </Container>
      </>
    )
  }

  return <></>
}
