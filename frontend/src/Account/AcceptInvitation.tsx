import { useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'

/** Data */
import { StatusContext } from 'App/StatusProvider'
import { useMutation } from 'react-query'

/** Material UI */
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** UI */
import { AuthTemplate } from 'UI/Layout'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

/** Helpers */
import { AxiosError } from 'axios'
import { useAxios, isFieldError, LOGIN_URL } from 'Lib'

interface Inputs {
  code: string
}

interface AcceptanceParams extends Inputs {
  code: string
  password: string
}

interface Form extends AcceptanceParams {
  password_confirmation: string
}

interface ParamType {
  code: string
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
  message: {
    margin: '0 0 2rem 0',
  },
}))

export function AcceptInvitation() {
  const axios = useAxios()
  const params = useParams<ParamType>()
  const classes = useStyles()
  const history = useHistory()
  const { showStatus } = useContext(StatusContext)

  const getErrorMessage = (error: string): string => {
    const reasons = new Map<string, string>()
    reasons.set('general', 'We are sorry, but we cannot activate your account at this time.')
    reasons.set(
      'invitation-does-not-exist',
      'There is no user invitation associated with this link'
    )
    reasons.set('invitation-is-expired', 'This invitation is expired')
    reasons.set('user-does-not-exist', 'This invitation user is invalid')
    reasons.set('invitation-already-accepted', 'This invitation was already accepted.')
    reasons.set('could-not-activate-user', 'There was an error activating your account')

    if (reasons.has(error)) {
      return reasons.get(error) as string
    }

    return reasons.get('general') as string
  }

  const acceptAction = async (params: AcceptanceParams) => {
    return await axios.post('/verify_user', params)
  }

  const acceptInvitation = useMutation(acceptAction, {
    onSuccess: () => {
      reset()
      showStatus('Your account is active. You may now login.')
      history.push(LOGIN_URL)
    },
    onError: (data: AxiosError) => {
      const error = data.response?.data?.error ?? ''
      const message = getErrorMessage(error)
      showStatus(message, 'error')
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

  const { register, handleSubmit, errors, reset } = useForm<Form>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: AcceptanceParams) => {
    acceptInvitation.mutate({ code: params.code, password: data.password })
  }

  return (
    <AuthTemplate title="Accept Invitation" isLoading={acceptInvitation.isLoading}>
      <>
        <Grid container justify="center" spacing={2} className={classes.message}>
          <Grid item xs={6}>
            <Alert severity="success">
              <Typography variant="h1">You are almost ready to log in.</Typography>
              <Typography>To set your password, just fill out the form below.</Typography>
            </Alert>
          </Grid>
        </Grid>

        <Grid container justify="center" spacing={2}>
          <Grid container item md={6} sm={9} xs={12}>
            <Paper elevation={2} className={classes.paper}>
              <Box my={3}>
                <Typography variant="h3" align="center">
                  Enter a password
                </Typography>
              </Box>
              <form id="set-password-form" onSubmit={handleSubmit(onSubmit)}>
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
                  Set Your Password
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </>
    </AuthTemplate>
  )
}
