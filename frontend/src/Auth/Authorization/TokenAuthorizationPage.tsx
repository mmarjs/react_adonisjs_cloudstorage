import React from 'react'
import { Template } from 'UI'
import queryString from 'query-string'
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

export function TokenAuthorizationPage() {
  const params = queryString.parse(window.location.search)
  const service = params?.service ?? 'your cloud account'

  return (
    <Template title="Evidence Authorization">
      <Grid container justify="center" alignItems="center" spacing={2}>
        <Grid xs={9}>
          <Alert severity="success">
            <Typography>
              Thank you for authorizing us to collect evidence from {service}. We will begin
              shortly.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Template>
  )
}
