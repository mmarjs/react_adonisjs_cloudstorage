import { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useSelector, useDispatch } from 'react-redux'
import { useMutation } from 'react-query'
import { StatusContext } from 'App/StatusProvider'
import { AppState } from 'App/reducers'
import { setUser } from 'Data/User'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ContactPhoneIcon from '@material-ui/icons/ContactPhone'
import MuiPhoneNumber from 'material-ui-phone-number'

/** UI */
import { Template, IconTitle } from 'UI'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

/** Helpers */
import { User } from 'types'
import { useAxios, USER_PERSONAL_INFO_URL, isFieldError, useIsMounted } from 'Lib'

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

export function PhoneForm() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const history = useHistory()
  const { setSafely } = useIsMounted()
  const user = useSelector((state: AppState) => state.user)
  const [phone, setPhone] = useState(user?.phone)

  type Inputs = {
    phone: string
  }

  const schema = yup.object().shape({
    phone: yup.string(),
  })

  const { control, handleSubmit, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const updateName = async (params: object): Promise<User> => {
    const { data } = await axios.put(`/users/${user.id}/update_profile`, params)
    return data
  }

  const savePhone = useMutation(updateName, {
    onSuccess: async (data) => {
      dispatch(setUser(data))
      showStatus('Your phone number was updated')
      reset()
      history.push(USER_PERSONAL_INFO_URL)
    },
    onError: () => {
      reset()
    },
  })

  const onSubmit = (data: Inputs) => {
    savePhone.mutate({ phone })
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
      isLoading={savePhone.isLoading}
      isError={savePhone.isError}
      errorMessage="There was an error updating your phone number. Please try again."
    >
      <Grid container justify="center" alignItems="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-name-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
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
                        label="Phone"
                        variant="outlined"
                        value={phone}
                        onChange={(ev) => {
                          const next = String(ev)
                          setSafely(setPhone, next)
                        }}
                        error={isFieldError(errors.phone?.message)}
                        helperText={errors.phone?.message}
                      />
                    )}
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
