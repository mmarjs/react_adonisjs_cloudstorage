import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { AppState } from 'App/reducers'
import { setUser } from 'Data/User'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation } from 'react-query'
import { StatusContext } from 'App/StatusProvider'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import makeStyles from '@material-ui/core/styles/makeStyles'
import SecurityIcon from '@material-ui/icons/Security'

/** UI */
import { Template, IconTitle } from 'UI'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

/** Helpers */
import { User } from 'types'
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

export function EmailForm() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)

  type Inputs = {
    email: string
  }

  const schema = yup.object().shape({
    email: yup
      .string()
      .required('An email address is required')
      .email('You must enter a valid email'),
  })

  const { register, handleSubmit, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const emailMutation = async (params: object): Promise<User> => {
    const { data } = await axios.put(`/users/${user.id}/update_profile`, params)
    return data
  }

  const saveEmail = useMutation(emailMutation, {
    onSuccess: async (data) => {
      dispatch(setUser(data))
      showStatus('Your email address was updated')
      history.push(USER_SECURITY_URL)
    },
    onError: () => {
      reset()
    },
  })

  const onSubmit = (data: Inputs) => {
    saveEmail.mutate(data)
  }

  const Title = () => (
    <IconTitle
      Icon={() => <SecurityIcon className={classes.securityIcon} />}
      text="Security & Sign In"
    />
  )

  return (
    <Template
      title="Security & Sign In"
      TitleComponent={Title}
      isLoading={saveEmail.isLoading}
      isError={saveEmail.isError}
      errorMessage="There was an error updating your email address. Please try again."
    >
      <Grid container justify="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-email-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="email"
                    name="email"
                    label="Email"
                    variant="outlined"
                    type="email"
                    defaultValue={user.email}
                    error={isFieldError(errors.email?.message)}
                    helperText={errors.email?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center" alignItems="center">
              <Grid item md={4} sm={6} xs={10}>
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
