import React from 'react'
import { AuthTemplate } from 'UI/Layout/Template/AuthTemplate'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'

export function ErrorPage() {
  return (
    <AuthTemplate title="Error">
      <Box display="flex" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h1" align="center" paragraph>
          We're sorry, there was an error
        </Typography>
        <Typography variant="h3" align="center">
          Please check back again soon.
        </Typography>
      </Box>
    </AuthTemplate>
  )
}

export function NotFound() {
  return (
    <AuthTemplate title="Not Found">
      <Box display="flex" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h1" align="center" paragraph>
          The page you are looking for does not exist
        </Typography>
      </Box>
    </AuthTemplate>
  )
}

export function NotAuthorized() {
  return (
    <AuthTemplate title="Not Authorized">
      <Box display="flex" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h1" align="center" paragraph>
          You are not authorized to view this page
        </Typography>
      </Box>
    </AuthTemplate>
  )
}

export function UnderDevelopment() {
  return (
    <AuthTemplate title="Not Found">
      <Box display="flex" alignItems="center" justifyContent="center" mt={5}>
        <Typography variant="h1" align="center" paragraph>
          This feature is currently under development
        </Typography>
      </Box>
    </AuthTemplate>
  )
}
