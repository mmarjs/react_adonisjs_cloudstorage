import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import makeStyles from '@material-ui/core/styles/makeStyles'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { REQUEST_RESET_URL, REGISTRATION_URL, isFieldError, useIsMounted } from 'Lib'
import { ValidateLoginParams } from 'types'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '2rem',
    border: '1px',
    borderColor: '#efe',
    borderRadius: '3rem',
    width: '400px',
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
    margin: 'auto',
  },
  field: {
    marginTop: '0.5rem',
  },
  validationItem: {
    fontSize: '1.5rem',
  },
  loginIssue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  passwordLink: {
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  login: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  visibility: {
    color: `${theme.palette.primary.main}`,
  },
  visibilityOff: {
    color: `${theme.palette.blue.main}`,
  },
}))

interface Props {
  processValidateLogin: (params: ValidateLoginParams) => void
}

export default function ValidateLoginForm(props: Props) {
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const [showPassword, setShowPassword] = useState(false)
  const { processValidateLogin } = props

  const handleClickShowPassword = () => {
    setSafely(setShowPassword, !showPassword)
  }
  const handleMouseDownPassword = () => {
    setSafely(setShowPassword, !showPassword)
  }

  interface Params {
    email: string
    password: string
  }

  const loginSchema = yup.object().shape({
    email: yup.string().required('Your email is required'),
    password: yup.string().required('Your password is required'),
  })

  const { register, handleSubmit, errors } = useForm<Params>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = (params: Params) => {
    const validateLoginParams: ValidateLoginParams = {
      action: 'validate-login',
      ...params,
    }

    processValidateLogin(validateLoginParams)
  }

  return (
    <>
      <Grid container justify="center" spacing={2}>
        <Grid container item md={6} sm={9} xs={12}>
          <Paper elevation={2} className={classes.paper}>
            <Typography variant="h3" align="center">
              Welcome to Evidence Locker
            </Typography>

            <Box my={2}>
              <Typography align="center" color="primary">
                <strong>Sign-in to your account</strong>
              </Typography>
            </Box>

            <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <InputLabel htmlFor="email">
                  <strong>Email</strong>
                </InputLabel>
                <TextField
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  data-cy="email"
                  variant="outlined"
                  size="small"
                  className={classes.field}
                  inputRef={register}
                  error={isFieldError(errors?.email?.message)}
                  helperText={errors?.email?.message}
                />
              </FormGroup>

              <FormGroup>
                <InputLabel htmlFor="password">
                  <strong>Password</strong>
                </InputLabel>

                <TextField
                  id="password"
                  name="password"
                  placeholder="your password here"
                  type={showPassword ? 'text' : 'password'}
                  data-cy="password"
                  variant="outlined"
                  size="small"
                  className={classes.field}
                  inputRef={register}
                  error={isFieldError(errors?.password?.message)}
                  helperText={errors?.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          style={{ padding: 0 }}
                        >
                          {showPassword ? (
                            <Visibility className={classes.visibility} />
                          ) : (
                            <VisibilityOff className={classes.visibilityOff} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormGroup>

              <Box display="flex" flexDirection="column" textAlign="right" py={1}>
                <Link to={REQUEST_RESET_URL} className={classes.passwordLink}>
                  <Typography className={classes.passwordLink}>Forgot your password?</Typography>
                </Link>
              </Box>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                className="form-button-spacing"
                data-cy="submit"
              >
                Sign In
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
          <strong>Don't have an account?</strong>
        </Typography>

        <Link to={REGISTRATION_URL} className={classes.login}>
          <Typography className={classes.login}>Sign-up</Typography>
        </Link>
      </Box>
    </>
  )
}
