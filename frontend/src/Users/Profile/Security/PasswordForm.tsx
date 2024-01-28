import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useMutation } from 'react-query'
import { useSelector, useDispatch } from 'react-redux'
import { StatusContext } from 'App/StatusProvider'
import { AppState } from 'App/reducers'
import { setUser } from 'Data/User'

import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import makeStyles from '@material-ui/core/styles/makeStyles'
import SecurityIcon from '@material-ui/icons/Security'

/** UI */
import { Template, IconTitle } from 'UI'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { User } from 'types'

/** Helpers */
import { useAxios, USER_SECURITY_URL, isFieldError } from 'Lib'

const useStyles = makeStyles((theme) => ({
  row: {
    margin: `${theme.spacing(3)}px 0`,
  },
  title: {
    fontSize: '2rem',
    margin: `0 0 ${theme.spacing(8)}px 0`,
  },
  securityIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#b98f04`,
    },
  },
}))

export function PasswordForm() {
  const classes = useStyles()
  const axios = useAxios()
  const dispatch = useDispatch()
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)
  const { showStatus } = useContext(StatusContext)

  type Inputs = {
    password: string
    password_confirmation: string
  }

  const schema = yup.object().shape({
    password: yup
      .string()
      .min(8, 'The password must be at least 8 characters long')
      .required('A password is required'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password'), null], 'The passwords must match'),
  })

  const { register, handleSubmit, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const action = async (password: string): Promise<User> => {
    const { data } = await axios.put(`/users/${user.id}/update_profile`, { password })
    return data
  }

  const updater = useMutation(action, {
    onSuccess: async (data) => {
      dispatch(setUser(data))
      showStatus('Your password was updated')
      history.push(USER_SECURITY_URL)
    },
    onError: () => {
      reset()
    },
  })

  const onSubmit = async (data: Inputs) => {
    updater.mutate(data.password)
  }

  const Title = () => (
    <IconTitle
      Icon={() => <SecurityIcon className={classes.securityIcon} />}
      text="Security & Sign In"
    />
  )

  return (
    <Template
      title="Security"
      TitleComponent={Title}
      isLoading={updater.isLoading}
      isError={updater.isError}
      errorMessage="There was an error updating your password. Please try again soon."
    >
      <Grid container justify="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-email-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="password"
                    name="password"
                    label="Password"
                    variant="outlined"
                    type="password"
                    error={isFieldError(errors.password?.message)}
                    helperText={errors.password?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="password_confirmation"
                    name="password_confirmation"
                    label="Password Confirmation"
                    variant="outlined"
                    type="password"
                    error={isFieldError(errors.password_confirmation?.message)}
                    helperText={errors.password_confirmation?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center" alignItems="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <Button variant="contained" fullWidth color="primary" type="submit">
                    Update
                  </Button>
                </FormGroup>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Template>
  )
}
