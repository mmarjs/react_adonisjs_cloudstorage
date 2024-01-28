import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { StatusContext } from 'App/StatusProvider'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation } from 'react-query'
import { AppState } from 'App/reducers'
import { setUser } from 'Data/User'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'

/** UI */
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Template, IconTitle } from 'UI'

/** Helpers */
import { User } from 'types'
import { useAxios, USER_PERSONAL_INFO_URL, isFieldError } from 'Lib'

const useStyles = makeStyles((theme) => ({
  row: {
    margin: `${theme.spacing(3)}px 0`,
  },
  title: {
    fontSize: '2rem',
    margin: `0 0 ${theme.spacing(8)}px 0`,
  },
  infoIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#4c5964`,
    },
  },
}))

export function NameForm() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)

  type Inputs = {
    firstName: string
    lastName: string
  }

  const schema = yup.object().shape({
    firstName: yup.string().required('Your first name is required'),
    lastName: yup.string().required('Your last name is required'),
  })

  const { register, handleSubmit, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const updateName = async (params: object): Promise<User> => {
    const { data } = await axios.put(`/users/${user.id}/update_profile`, params)
    return data
  }

  const saveName = useMutation(updateName, {
    onSuccess: async (data) => {
      dispatch(setUser(data))
      showStatus('Your name was updated')
      history.push(USER_PERSONAL_INFO_URL)
    },
    onError: () => {
      reset()
    },
  })

  const onSubmit = (data: Inputs) => {
    saveName.mutate(data)
  }

  const Title = () => (
    <IconTitle
      Icon={() => <ContactPhoneIcon className={classes.infoIcon} />}
      text="Personal Info"
    />
  )

  return (
    <Template
      title="Personal Info"
      TitleComponent={Title}
      isLoading={saveName.isLoading}
      isError={saveName.isError}
      errorMessage="There was an error updating your name. Please try again."
    >
      <Grid container justify="center" alignItems="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-name-form" onSubmit={handleSubmit(onSubmit)}>
            {saveName.isError && (
              <Grid container justify="center" spacing={4} className={classes.row}>
                <Grid item md={6} sm={9} xs={12}>
                  <Alert severity="error">
                    There was an error updating your name. Please try again.
                  </Alert>
                </Grid>
              </Grid>
            )}

            <Grid container item xs={12} justify="center">
              <Grid item md={4} sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    variant="outlined"
                    defaultValue={user.first_name}
                    error={isFieldError(errors.firstName?.message)}
                    helperText={errors.lastName?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center">
              <Grid item md={4} sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    variant="outlined"
                    defaultValue={user.last_name}
                    error={isFieldError(errors.lastName?.message)}
                    helperText={errors.lastName?.message}
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
