import React, { useState, useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { ShareTemplate } from 'UI/Layout/Template/ShareTemplate'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { AppState } from 'App/reducers'
import { isFieldError, useIsMounted, useAxios, SHARE_SECURE_URL, isProduction } from 'Lib'
import MuiPhoneNumber from 'material-ui-phone-number'
import {
  setLoggedIn,
  setToken,
  setShareLink,
  setGrantor,
  setGrantorCompany,
  setHasLoggedInBefore,
  setTimeStamp,
} from 'Data/Share'
import { setFieldNodeId } from 'Data/TableViewDataList'
import {
  ShareLoginInput,
  ShareLoginResponse,
  ErrorResponse,
  ShareLinkStatusResponse,
  ShareLinkParam,
  ShareLoginParams,
  QueryKey,
} from 'types'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputAdornment from '@material-ui/core/InputAdornment'
import { LogRocketContext } from 'Lib/LogRocketProvider'
import { AxiosResponse, AxiosError } from 'axios'

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
  login: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  restoreButton: {
    background: '#4472C4',
    color: '#ffffff',
    borderRadius: '20px',
    padding: '5px 30px',
    textTransform: 'capitalize',
    margin: 'auto',
  },
  formBottom: {
    alignItems: 'center',
    marginRight: '20px',
  },
  backButton: {
    'color': '#4472C4',
    'cursor': 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  visibility: {
    color: `${theme.palette.primary.main}`,
  },
  visibilityOff: {
    color: `${theme.palette.blue.main}`,
  },
}))

export function ShareLogin() {
  const { setSafely } = useIsMounted()
  const classes = useStyles()
  const linkParam = useParams<ShareLinkParam>()
  const dispatch = useDispatch()
  const history = useHistory()
  const axios = useAxios()
  const logrocket = useContext(LogRocketContext)
  const [step, setStep] = useState<'name' | 'login'>('name')
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [phone, setPhone] = useState<any>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<undefined | string>(undefined)
  const [isLoginError, setIsLoginError] = useState(false)
  const hasLoggedInBefore = useSelector((state: AppState) => state.share.hasLoggedInBefore)
  const grantor = useSelector((state: AppState) => state.share.grantor)
  const grantorCompany = useSelector((state: AppState) => state.share.grantorCompany)

  const getLinkStatus = async (): Promise<AxiosResponse<ShareLinkStatusResponse>> => {
    const link = linkParam.link
    return await axios.get(`/share/link_status/${link}`)
  }

  const linkStatusQuery = useQuery(QueryKey.shareLinkStatus, getLinkStatus, {
    onSuccess: (data) => {
      const { grantor, company, hasLoggedInBefore: hasPreviousLogin } = data.data
      dispatch(setGrantor(grantor))
      dispatch(setGrantorCompany(company))
      dispatch(setHasLoggedInBefore(hasPreviousLogin))
    },
    onError: (err: AxiosError) => {
      const message = makeErrorMessage(err?.response?.data?.error)
      setSafely(setErrorMessage, message)
    },
    retry: false,
  })

  const nameSchema = yup.object().shape({
    firstName: yup.string().required('Your first name is required'),
    lastName: yup.string().required('Your last name is required'),
  })

  const loginSchema = yup.object().shape({
    email: yup.string().required('Your email is required'),
    password: yup.string().required('Password is required'),
  })

  const chooseSchema = () => {
    if (hasLoggedInBefore) {
      return loginSchema
    }

    if (step === 'login') {
      return loginSchema
    }

    return nameSchema
  }

  const { register, control, handleSubmit, errors } = useForm<ShareLoginParams>({
    resolver: yupResolver(chooseSchema()),
  })

  const loginAction = async (params: ShareLoginInput): Promise<ShareLoginResponse> => {
    const { data } = await axios.post('/share_login', params)
    return data
  }

  const login = useMutation(loginAction, {
    onSuccess: (data) => {
      const loginData = data as ShareLoginResponse
      dispatch(setLoggedIn(true))
      dispatch(setToken(loginData.token))
      dispatch(setTimeStamp(''))

      if (data.shareLink) {
        dispatch(setHasLoggedInBefore(true))
        dispatch(setFieldNodeId(data.shareLink.folder_id))
        dispatch(setShareLink(data.shareLink))

        if (isProduction) {
          logrocket?.identify(`share-link-${data.shareLink.id}`, {
            name: `${data.shareLink?.first_name} ${data.shareLink?.last_name}`,
            shareType: `${data.shareLink?.share_type}`,
          })
        }

        history.push(SHARE_SECURE_URL)
      } else {
        setSafely(setErrorMessage, 'There was a login error, please try again soon.')
        setSafely(setIsLoginError, true)
      }
    },
    onError: (error: ErrorResponse) => {
      const message = makeErrorMessage(error?.error)
      setSafely(setErrorMessage, message)
    },
  })

  const onSubmit = async (data: ShareLoginParams) => {
    if (hasLoggedInBefore) {
      login.mutate({
        email: data.email,
        password: data.password,
        link: linkParam.link,
      })
    } else {
      if (step === 'name') {
        setSafely(setFirstName, data.firstName)
        setSafely(setLastName, data.lastName)
        setSafely(setStep, 'login')
      }

      if (step === 'login') {
        login.mutate({
          firstName: firstName,
          lastName: lastName,
          companyName: company,
          phone: phone,
          email: data.email,
          password: data.password,
          link: linkParam.link,
        })
      }
    }
  }

  const handleClickShowPassword = () => {
    setSafely(setShowPassword, !showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const makeErrorMessage = (msg: string): string => {
    let message: string = ''

    switch (msg) {
      case 'no-such-account':
        message = 'This file share link is invalid.'
        break
      case 'invalid-password':
        message = 'Incorrect email or password. Please try again.'
        break
      case 'share-link-expired':
        message = `This share link is expired.`
        break
      case 'share-link-deleted':
        message = `This share link was deleted.`
        break
      case 'failed-to-login':
        message = `You were not able to be logged in at this time. Please try again soon.`
        break
      case 'share-type-not-supported':
        message = 'This type of share link is no longer supported.'
        break
      default:
        message = 'You were not able to be logged in at this time. Please try again soon.'
        break
    }

    return message
  }

  return (
    <>
      <ShareTemplate
        title="Login"
        isLoading={login.isLoading || linkStatusQuery.isLoading}
        isError={login.isError || isLoginError || linkStatusQuery.isError}
        errorMessage={errorMessage}
      >
        <Grid container justify="center" spacing={2}>
          <Grid container item md={6} sm={9} xs={12}>
            <Paper elevation={2} className={classes.paper}>
              <Typography variant="h1" align="center">
                <strong>Secure Access</strong>
              </Typography>

              <Box my={2}>
                <Typography align="center">
                  Granted By: {grantor} at {grantorCompany}
                </Typography>
              </Box>

              <Box my={2}>
                <Typography color="primary" align="center">
                  Login
                </Typography>
              </Box>
              <form id="login-form-step" onSubmit={handleSubmit(onSubmit)}>
                {hasLoggedInBefore ? (
                  <>
                    <FormGroup>
                      <TextField
                        id="email"
                        name="email"
                        placeholder="Email (required)"
                        type="text"
                        data-cy="text"
                        variant="outlined"
                        size="small"
                        className={classes.field}
                        inputRef={register}
                        defaultValue={email}
                        onChange={(event) => {
                          setSafely(setEmail, event.target.value)
                        }}
                        error={isFieldError(errors?.email?.message)}
                        helperText={errors?.email?.message}
                      />
                    </FormGroup>

                    <FormGroup>
                      <TextField
                        id="password"
                        name="password"
                        placeholder="Password (required)"
                        type={showPassword ? 'text' : 'password'}
                        data-cy="text"
                        variant="outlined"
                        size="small"
                        className={classes.field}
                        inputRef={register}
                        defaultValue={password}
                        onChange={(event) => {
                          setSafely(setPassword, event.target.value)
                        }}
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
                    <FormGroup row className={classes.formBottom}>
                      <Button
                        variant="contained"
                        className={classes.restoreButton}
                        type="submit"
                        data-cy="submit"
                      >
                        Access
                      </Button>
                    </FormGroup>
                  </>
                ) : (
                  <>
                    {step === 'name' && (
                      <>
                        <FormGroup>
                          <TextField
                            id="firstname"
                            name="firstName"
                            placeholder="First name (required)"
                            type="text"
                            data-cy="text"
                            variant="outlined"
                            size="small"
                            className={classes.field}
                            inputRef={register}
                            defaultValue={firstName}
                            onChange={(event) => {
                              setSafely(setFirstName, event.target.value)
                            }}
                            error={isFieldError(errors?.firstName?.message)}
                            helperText={errors?.firstName?.message}
                          />
                        </FormGroup>

                        <FormGroup>
                          <TextField
                            id="lastname"
                            name="lastName"
                            placeholder="Last Name (required)"
                            type="text"
                            data-cy="text"
                            variant="outlined"
                            size="small"
                            className={classes.field}
                            inputRef={register}
                            defaultValue={lastName}
                            onChange={(event) => {
                              setSafely(setLastName, event.target.value)
                            }}
                            error={isFieldError(errors?.lastName?.message)}
                            helperText={errors?.lastName?.message}
                          />
                        </FormGroup>

                        <FormGroup>
                          <TextField
                            id="company"
                            name="company"
                            placeholder="Company Name"
                            type="text"
                            data-cy="text"
                            variant="outlined"
                            size="small"
                            className={classes.field}
                            inputRef={register}
                            defaultValue={company}
                            onChange={(event) => {
                              setSafely(setCompany, event.target.value)
                            }}
                          />
                        </FormGroup>
                        <FormGroup row>
                          <Button
                            variant="contained"
                            className={classes.restoreButton}
                            type="submit"
                            data-cy="submit"
                          >
                            Next
                          </Button>
                        </FormGroup>
                      </>
                    )}
                    {step === 'login' && (
                      <>
                        <FormGroup>
                          <Controller
                            control={control}
                            id="phone"
                            name="phone"
                            render={() => (
                              <MuiPhoneNumber
                                defaultCountry={'us'}
                                regions={['north-america']}
                                id="phone"
                                name="phone"
                                label="Phone number"
                                variant="outlined"
                                size="small"
                                value={phone}
                                onChange={(value) => {
                                  setSafely(setPhone, String(value))
                                }}
                              />
                            )}
                          />
                        </FormGroup>
                        <FormGroup>
                          <TextField
                            id="email"
                            name="email"
                            placeholder="Email (required)"
                            type="text"
                            data-cy="text"
                            variant="outlined"
                            size="small"
                            className={classes.field}
                            inputRef={register}
                            defaultValue={email}
                            onChange={(event) => {
                              setSafely(setEmail, event.target.value)
                            }}
                            error={isFieldError(errors?.email?.message)}
                            helperText={errors?.email?.message}
                          />
                        </FormGroup>

                        <FormGroup>
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
                        <FormGroup row className={classes.formBottom}>
                          <span className={classes.backButton} onClick={() => setStep('name')}>
                            Back
                          </span>
                          <Button
                            variant="contained"
                            className={classes.restoreButton}
                            type="submit"
                            data-cy="submit"
                          >
                            Access
                          </Button>
                        </FormGroup>
                      </>
                    )}
                  </>
                )}
              </form>
            </Paper>
          </Grid>
        </Grid>
      </ShareTemplate>
    </>
  )
}
