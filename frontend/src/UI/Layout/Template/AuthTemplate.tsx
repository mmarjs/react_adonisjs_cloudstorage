import React from 'react'
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Loader } from 'UI'
import { Helmet } from 'react-helmet-async'
import { APP_NAME } from 'Lib'

interface Props {
  title: string
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  children: React.ReactNode
}

const useStyles = makeStyles((theme) => ({
  grid: {
    'display': 'grid',
    'place-items': 'center',
    'grid-template-columns': '1fr',
    'grid-template-rows': '1fr',
    'gap': '0px 0px',
    'grid-template-areas': `
    "content"
    `,
  },
  content: {
    'grid-area': 'content',
    'width': '100vw',
    'height': '100vh',
  },
  error: {
    margin: '1rem 0',
  },
  wrapper: {
    padding: '4rem 0 0 0',
  },
}))

export function AuthTemplate(props: Props) {
  const { title, isLoading, isError, errorMessage, children } = props
  const classes = useStyles()

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
        <div className={classes.grid}>
          <div className={classes.content}>
            {isError && errorMessage !== undefined && (
              <Grid container justify="center" className={classes.error}>
                <Grid item xs={6}>
                  <Alert severity="error">{errorMessage}</Alert>
                </Grid>
              </Grid>
            )}
            <div className={classes.wrapper}>{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
