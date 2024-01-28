import React from 'react'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Alert from '@material-ui/lab/Alert'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { AppState } from 'App/reducers'
import { APP_NAME } from 'Lib'
import { Loader } from 'UI'
import { ViewerTemplateProps } from 'types'
import { DesktopCheck } from '../../Components/DesktopCheck'
import { ViewerHeader } from 'UI/Layout/Header'
import { GuestHeader } from 'UI/Layout/Header'

const useStyles = makeStyles((theme) => ({
  content: {
    height: 'calc(100% - 82px)',
  },
  mainGrid: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  titleRow: {
    height: '50px',
  },
  alertRow: {
    margin: '2rem 0',
  },
  multiRow: {
    minHeight: '50px',
  },
  collapseMenu: {
    marginLeft: '70px',
  },
}))

export function ViewerTemplate(props: ViewerTemplateProps) {
  const { title, isLoading, isError, errorMessage, TitleComponent, desktopOnly, children } = props

  const loggedIn = useSelector((state: AppState) => state.auth.loggedIn)
  const collapseMenuOpen = useSelector((state: AppState) => state.workspaceData.collpaseOpen)
  const classes = useStyles()
  desktopOnly && <DesktopCheck title={title} />

  return (
    <>
      <Helmet>
        <title>
          {title} | {APP_NAME}
        </title>
      </Helmet>

      {isLoading ? (
        <Loader />
      ) : (
        <Box className={classes.mainGrid}>
          <AppBar position="static">
            <AppBar position="static">{loggedIn ? <ViewerHeader /> : <GuestHeader />}</AppBar>
          </AppBar>
          <Grid container className={classes.content}>
            <Grid
              container
              justify={!collapseMenuOpen ? 'center' : 'flex-start'}
              alignItems="center"
              className={classes.titleRow}
            >
              {!collapseMenuOpen && <Grid item xs={2}></Grid>}
              <Grid item xs={10} className={collapseMenuOpen ? classes.collapseMenu : ''}>
                {TitleComponent !== undefined ? (
                  <TitleComponent />
                ) : (
                  <Typography variant="h1">{title}</Typography>
                )}
              </Grid>
            </Grid>
            {/* <Grid container justify="center" alignItems="center" className={classes.multiRow}>
              <Grid item></Grid>
            </Grid> */}

            {isError && (
              <Grid container justify="center" className={classes.alertRow}>
                <Grid item md={6} sm={9} xs={12}>
                  <Alert severity="info">{errorMessage}</Alert>
                </Grid>
              </Grid>
            )}

            {children}
          </Grid>
        </Box>
      )}
    </>
  )
}
