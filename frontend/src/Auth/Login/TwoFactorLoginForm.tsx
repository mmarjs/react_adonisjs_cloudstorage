import React from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { LOGIN_URL } from 'Lib'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Alert from '@material-ui/lab/Alert'
import OtpInput from 'react-otp-input'

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
  validationMessage: {
    fontSize: '1rem',
    color: `${theme.palette.danger.main}`,
  },
  login: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  helpText: {
    margin: '0 0 2rem 0',
  },
  otp: {
    width: '3rem',
    height: '3rem',
    margin: '0 0.5rem',
    fontSize: '2rem',
    borderRadius: '4px',
    border: `1px solid rgba(0,0,0,0.3)`,
    [theme.breakpoints.down('sm')]: {
      width: '2rem',
      height: '2rem',
      margin: '0 0.25rem',
    },
  },
}))

interface Props {
  processVerifyTwoFactor: (twoFactorToken: string) => void
}

export default function TwoFactorLogin(props: Props) {
  const classes = useStyles()

  const { processVerifyTwoFactor } = props

  interface Params {
    twoFactorToken: string
  }

  const schema = yup.object().shape({
    twoFactorToken: yup
      .string()
      .matches(/^\d+$/, 'The OTP should have numbers only')
      .required('You must enter the OTP')
      .length(6, 'The OTP must be 6 digits long'),
  })

  const { handleSubmit, errors, control } = useForm<Params>({
    resolver: yupResolver(schema),
  })

  const onSubmit = (params: Params) => {
    processVerifyTwoFactor(params.twoFactorToken)
  }

  return (
    <>
      <Grid container justify="center" spacing={2}>
        <Grid container item md={6} sm={9} xs={12}>
          <Alert severity="info" className={classes.helpText}>
            Your account requires two factor authentication to proceed. We've sent a One Time Pin
            (OTP) to your email address. Just paste that code below to login.
            <br /> <br />
            <strong>Note: </strong> The OTP is only valid for 5 minutes.
          </Alert>

          <Paper elevation={2} className={classes.paper}>
            <Box my={2}>
              <Typography align="center" color="primary">
                <strong>Enter your One Time Pin</strong>
              </Typography>
            </Box>

            <form id="two-factor-login-form" onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  m={2}
                >
                  <Controller
                    control={control}
                    id="twoFactorToken"
                    name="twoFactorToken"
                    defaultValue=""
                    render={({ value, onChange }) => (
                      <OtpInput
                        value={value}
                        onChange={onChange}
                        numInputs={6}
                        separator={<span>-</span>}
                        inputStyle={classes.otp}
                        hasErrored={errors?.twoFactorToken?.message !== undefined}
                      />
                    )}
                  />
                  {errors?.twoFactorToken?.message !== undefined && (
                    <Typography className={classes.validationMessage}>
                      {errors?.twoFactorToken?.message}
                    </Typography>
                  )}
                </Box>
              </FormGroup>

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

        <Link
          to={LOGIN_URL}
          className={classes.login}
          onClick={() => {
            window.location.reload()
          }}
        >
          <Typography className={classes.login}>Back To Login</Typography>
        </Link>
      </Box>
    </>
  )
}
