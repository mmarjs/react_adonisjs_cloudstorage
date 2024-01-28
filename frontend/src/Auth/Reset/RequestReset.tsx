import React from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from 'react-query'
import { LOGIN_URL, isFieldError, useAxios } from 'Lib'
import { AuthTemplate } from 'UI/Layout/Template/AuthTemplate'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Alert from '@material-ui/lab/Alert'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

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
  reset: {
    color: theme.palette.primary.main,
    margin: '1rem',
    fontWeight: 'bold',
  },
  field: {
    marginTop: '0.5rem',
  },
  login: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    textDecoration: 'none',
  },
}))

export function RequestReset() {
  const axios = useAxios()
  const classes = useStyles()

  type Inputs = {
    email: string
  }

  const action = async (params: Inputs) => {
    return await axios.post('/send_password_reset', params)
  }

  const request = useMutation(action)

  const onSubmit = async (data: Inputs) => {
    request.mutate(data)
  }

  const schema = yup.object().shape({
    email: yup.string().email('A valid email is required').required('Your email is required'),
  })

  const { register, handleSubmit, errors } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  return (
    <>
      <AuthTemplate
        title="Reset Password"
        isLoading={request.isLoading}
        isError={request.isError}
        errorMessage="There was an error sending your password request. Pleae try again soon."
      >
        {request.isSuccess && (
          <Grid container justify="center" style={{ margin: '1rem 0' }}>
            <Grid item lg={3} md={6} sm={9} xs={12}>
              <Alert severity="info">A reset email was sent</Alert>
            </Grid>
          </Grid>
        )}

        <Grid container justify="center" spacing={2}>
          <Grid container item md={6} sm={9} xs={12}>
            <Paper elevation={2} className={classes.paper}>
              <Typography variant="h3" align="center">
                Welcome to Evidence Locker
              </Typography>
              <Box my={3}>
                <Typography align="center" color="primary">
                  <strong>Request a password reset email</strong>
                </Typography>
              </Box>

              <form id="public-reset-email-form" onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                  <InputLabel htmlFor="email">
                    <strong>Email</strong>
                  </InputLabel>
                  <TextField
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    variant="outlined"
                    size="small"
                    className={classes.field}
                    inputRef={register}
                    error={isFieldError(errors?.email?.message)}
                    helperText={errors?.email?.message}
                  />
                </FormGroup>

                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  disabled={request.isSuccess}
                >
                  Send Reset Email
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignContent="center"
          textAlign="center"
          mt={2}
        >
          <Typography paragraph>
            <strong>Remember your password?</strong>
          </Typography>
          <Link to={LOGIN_URL} className={classes.login}>
            <Typography className={classes.login}>Log in</Typography>
          </Link>
        </Box>
      </AuthTemplate>
    </>
  )
}
