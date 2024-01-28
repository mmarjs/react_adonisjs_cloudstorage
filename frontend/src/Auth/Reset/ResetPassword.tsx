import { useState, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'

/** Data */
import { StatusContext } from 'App/StatusProvider'
import { useMutation } from 'react-query'

import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** UI  */

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { AuthTemplate } from 'UI/Layout/Template/AuthTemplate'

/** Helpers */
import { useAxios, useIsMounted, isFieldError, LOGIN_URL } from 'Lib'

interface ParamType {
  token: string
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '2rem',
    border: '1px',
    borderColor: '#efe',
    borderRadius: '3rem',
    margin: 'auto',
    width: '400px',
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
  verifyReset: {
    color: theme.palette.primary.main,
    margin: '1rem',
    fontWeight: 'bold',
  },
  field: {
    marginTop: '0.5rem',
  },
}))

export function ResetPassword() {
  const classes = useStyles()
  const params = useParams<ParamType>()
  const history = useHistory()
  const axios = useAxios()
  const { setSafely } = useIsMounted()
  const { showStatus } = useContext(StatusContext)
  const [message, setMessage] = useState<undefined | string>(undefined)

  interface Inputs {
    password: string
    password_confirmation: string
  }

  interface Params extends Inputs {
    token: string
  }

  const action = async (params: Params) => {
    return await axios.post('/reset_password', params)
  }

  const reset = useMutation(action, {
    onSuccess: () => {
      showStatus('Your password has been successfully updated.')
      history.push(LOGIN_URL)
    },
    onError: (error) => {
      const err: Error = error as Error

      switch (err.message) {
        case 'invalid-token':
          setSafely(
            setMessage,
            'We could not update your password because this password reset was already used. Please request another.'
          )
          break
        case 'expired-token':
          setSafely(
            setMessage,
            'We could not update your password because this link is expired. Please request another.'
          )
          break
        default:
          setSafely(
            setMessage,
            'There as an error updating your password. Please request another password reset email.'
          )
          break
      }
    },
  })

  const schema = yup.object().shape({
    password: yup
      .string()
      .min(8, 'The password must be at least 8 characters long')
      .required('A password is required'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password'), null], 'The passwords must match'),
  })

  const { register, handleSubmit, errors } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: Inputs) => {
    reset.mutate({ ...data, token: params.token })
  }
  return (
    <>
      <AuthTemplate
        title="Verify Password Reset"
        isLoading={reset.isLoading}
        isError={reset.isError}
        errorMessage={message}
      >
        <Grid container justify="center" spacing={2}>
          <Grid container item md={6} sm={9} xs={12}>
            <Paper elevation={2} className={classes.paper}>
              <Box my={3}>
                <Typography variant="h3" align="center">
                  Enter a new password
                </Typography>
              </Box>
              <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                  <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    variant="outlined"
                    size="small"
                    className={classes.field}
                    inputRef={register}
                    error={isFieldError(errors?.password?.message)}
                    helperText={errors?.password?.message}
                  />
                </FormGroup>

                <FormGroup>
                  <TextField
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    label="Password Confirmation"
                    variant="outlined"
                    size="small"
                    className={classes.field}
                    inputRef={register}
                    error={isFieldError(errors?.password_confirmation?.message)}
                    helperText={errors?.password_confirmation?.message}
                  />
                </FormGroup>

                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  className="form-button-spacing"
                >
                  Reset Password
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </AuthTemplate>
    </>
  )
}
