import React, { useEffect, useRef } from 'react'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

interface Props {
  children: React.ReactNode
}

export function CompatablityCheck(props: Props) {
  const isIncompatible = useRef(false)

  useEffect(() => {
    try {
      if (!window.hasOwnProperty('localStorage')) {
        isIncompatible.current = true
      }

      if (!('Notification' in window)) {
        isIncompatible.current = true
      }

      if (!CSS.supports('display', 'grid')) {
        isIncompatible.current = true
      }
    } catch (err) {
      isIncompatible.current = true
    }
  }, [])

  if (isIncompatible.current === true) {
    return (
      <Container style={{ padding: '2rem' }}>
        <Grid container justify="center">
          <Grid item xs={12}>
            <Typography variant="h3" align="center" paragraph>
              We're sorry, but your browser does not support this website's needed features
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" align="center" paragraph>
              Please update to a newer browser
            </Typography>
          </Grid>
        </Grid>
      </Container>
    )
  }

  return <>{props.children}</>
}
