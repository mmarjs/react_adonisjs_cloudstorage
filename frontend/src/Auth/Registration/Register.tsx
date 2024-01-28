import React from 'react'
import { useMutation } from 'react-query'
import { Link } from 'react-router-dom'
import { AuthTemplate } from 'UI/Layout'
import { LOGIN_URL, useAxios, isFieldError } from 'Lib'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Alert from '@material-ui/lab/Alert'

const useStyles = makeStyles((theme) => ({
  login: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    textDecoration: 'none',
  },
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
}))

export function Register() {
  const axios = useAxios()
  const classes = useStyles()

  interface Inputs {
    first_name: string
    last_name: string
    account_name: string
    email: string
    password: string
    password_confirmation: string
  }

  const schema = yup.object().shape({
    first_name: yup.string().required('A first name is required'),
    last_name: yup.string().required('A last name is required'),
    account_name: yup.string().required('The name of your company/organization is required'),
    email: yup.string().required('An email is required'),
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

  const registration = useMutation((params: Inputs) => axios.post('/register', params))

  const onSubmit = async (data: Inputs) => {
    registration.mutate(data)
  }

  return (
    <>
      <AuthTemplate
        title="Registration"
        isLoading={registration.isLoading}
        isError={registration.isError}
        errorMessage="There was an issue creating your account."
      >
        {registration.isSuccess ? (
          <Grid container justify="center" style={{ margin: '1rem 0' }}>
            <Grid item md={6} sm={9} xs={12}>
              <Alert severity="success">
                <Typography variant="h1" align="center" style={{ marginBottom: '1rem' }}>
                  Your account was created
                </Typography>
                <Typography>
                  A verification link has been sent to your email address. Please click on it to
                  verify yourself, and then you will be able to login.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        ) : (
          <>
            <Grid container justify="center" spacing={2}>
              <Grid container item md={6} sm={9} xs={12}>
                <Paper elevation={2} className={classes.paper}>
                  <Typography variant="h3" align="center">
                    Welcome to Evidence Locker
                  </Typography>
                  <Box my={3}>
                    <Typography align="center" color="primary">
                      <strong>Get started with your account today!</strong>
                    </Typography>
                  </Box>

                  <form id="register-user-form" onSubmit={handleSubmit(onSubmit)}>
                    <FormGroup>
                      <TextField
                        id="first_name"
                        name="first_name"
                        label="First Name"
                        type="text"
                        variant="outlined"
                        size="small"
                        inputRef={register}
                        error={isFieldError(errors.first_name?.message)}
                        helperText={errors.first_name?.message}
                      />
                    </FormGroup>

                    <FormGroup>
                      <TextField
                        id="last_name"
                        name="last_name"
                        label="Last Name"
                        type="text"
                        variant="outlined"
                        size="small"
                        inputRef={register}
                        error={isFieldError(errors.last_name?.message)}
                        helperText={errors.last_name?.message}
                      />
                    </FormGroup>

                    <FormGroup>
                      <TextField
                        id="account_name"
                        name="account_name"
                        label="Account Name"
                        type="text"
                        variant="outlined"
                        size="small"
                        inputRef={register}
                        error={isFieldError(errors.account_name?.message)}
                        helperText={errors.account_name?.message}
                      />
                    </FormGroup>

                    <FormGroup>
                      <TextField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        variant="outlined"
                        size="small"
                        inputRef={register}
                        error={isFieldError(errors.email?.message)}
                        helperText={errors.email?.message}
                      />
                    </FormGroup>

                    <FormGroup>
                      <TextField
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        size="small"
                        inputRef={register}
                        error={isFieldError(errors.password?.message)}
                        helperText={errors.password?.message}
                      />
                    </FormGroup>

                    <FormGroup>
                      <TextField
                        id="password_confirmation"
                        name="password_confirmation"
                        label="Password Confirmation"
                        type="password"
                        variant="outlined"
                        size="small"
                        inputRef={register}
                        error={isFieldError(errors.password_confirmation?.message)}
                        helperText={errors.password_confirmation?.message}
                      />
                    </FormGroup>

                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      className="form-button-spacing"
                    >
                      Sign Up
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
                <strong>Already have an account?</strong>
              </Typography>
              <Link to={LOGIN_URL} className={classes.login}>
                <Typography className={classes.login}>Sign-in</Typography>
              </Link>
            </Box>
          </>
        )}
      </AuthTemplate>
    </>
  )
}
