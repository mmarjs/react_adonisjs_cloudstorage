import { useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'

/** Data */
import { StatusContext } from 'App/StatusProvider'
import { useMutation } from 'react-query'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'

/** Helpers */
import { AxiosError } from 'axios'
import { AuthTemplate } from 'UI/Layout'
import { HOME_URL, useAxios } from 'Lib'

interface ParamType {
  token: string
}

export function VerifyAccount() {
  const params = useParams<ParamType>()
  const axios = useAxios()
  const history = useHistory()
  const { showStatus } = useContext(StatusContext)

  const setErrorMessage = (error: string) => {
    const reasons = new Map<string, string>()
    reasons.set('general', 'We are sorry, but we cannot verify your account at this time.')
    reasons.set('no-such-user', 'There is no user account associated with this link')
    reasons.set('already-verified', 'This acount has already been verified')
    reasons.set('already-active', 'This account is already active')
    reasons.set('could-not-verify-account-owner', 'There was an error veriying your account')

    if (reasons.has(error)) {
      return reasons.get(error)
    }

    return reasons.get('general')
  }

  const verify = useMutation((token: string) => axios.post('/verify_account', { token }), {
    onSuccess: () => {
      showStatus('Your account has been succesfully verified. You may now log in.')
      history.push(HOME_URL)
    },
    onError: (data: AxiosError) => {
      const error = data.response?.data?.error ?? ''
      const message = setErrorMessage(error)
      showStatus(message ?? 'Error', 'error')
    },
  })

  return (
    <AuthTemplate title="Verify Email" isLoading={verify.isLoading}>
      <Grid container justify="center" alignContent="center" alignItems="center" spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h1" align="center">
            Evidence Locker
          </Typography>
        </Grid>

        <Grid container item xs={12} justify="center" alignContent="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={verify.isError}
              onClick={() => {
                verify.mutate(params.token)
              }}
            >
              Verify Your Account
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </AuthTemplate>
  )
}
