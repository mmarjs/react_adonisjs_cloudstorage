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
import Alert from '@material-ui/lab/Alert'
import Paper from '@material-ui/core/Paper'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'

/** UI */
import { Template, IconTitle } from 'UI'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

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

export function AddressForm() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)

  type Inputs = {
    street: string
    state: string
    zip: number
  }

  const schema = yup.object().shape({
    street: yup.string(),
    state: yup.string(),
    zip: yup.number().positive('The zip code must be a number'),
  })

  const { register, handleSubmit, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const updateName = async (params: object): Promise<User> => {
    const { data } = await axios.put(`/users/${user.id}/update_profile`, params)
    return data
  }

  const mutation = useMutation(updateName, {
    onSuccess: async (data) => {
      dispatch(setUser(data))
      showStatus('Your address was updated')
      history.push(USER_PERSONAL_INFO_URL)
    },
    onError: () => {
      reset()
    },
  })

  const onSubmit = (data: Inputs) => {
    mutation.mutate(data)
  }

  const Title = () => (
    <IconTitle
      Icon={() => <ContactPhoneIcon className={classes.infoIcon} />}
      text="Personal Info"
    />
  )

  return (
    <Template title="Personal Info" TitleComponent={Title} isLoading={mutation.isLoading}>
      <Grid container justify="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-name-form" onSubmit={handleSubmit(onSubmit)}>
            {mutation.isError && (
              <Grid container justify="center" spacing={4} className={classes.row}>
                <Grid item md={6} sm={9} xs={12}>
                  <Alert severity="error">
                    There was an error updating your address. Please try again.
                  </Alert>
                </Grid>
              </Grid>
            )}

            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="street"
                    name="street"
                    label="Street Address"
                    variant="outlined"
                    defaultValue={user?.street}
                    error={isFieldError(errors.street?.message)}
                    helperText={errors.street?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="state"
                    name="state"
                    label="State"
                    variant="outlined"
                    defaultValue={user?.state}
                    error={isFieldError(errors.state?.message)}
                    helperText={errors.state?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="zip"
                    name="zip"
                    label="Zip Code"
                    variant="outlined"
                    defaultValue={user?.zip}
                    error={isFieldError(errors.zip?.message)}
                    helperText={errors.zip?.message}
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
