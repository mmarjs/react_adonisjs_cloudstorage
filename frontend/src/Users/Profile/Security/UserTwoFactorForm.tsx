import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Material UI */
import { StatusContext } from 'App/StatusProvider'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation } from 'react-query'
import { AppState } from 'App/reducers'
import { setUser } from 'Data/User'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import InputLabel from '@material-ui/core/InputLabel'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import SecurityIcon from '@material-ui/icons/Security'

/** UI */
import { Template, IconTitle } from 'UI'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

/** Helpers */
import { User } from 'types'
import { useAxios, USER_SECURITY_URL } from 'Lib'

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
  validation: {
    fontSize: '0.8rem',
    color: `${theme.palette.danger.main}`,
  },
}))

export function UserTwoFactorForm() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const history = useHistory()
  const user = useSelector((state: AppState) => state.user)

  type Params = {
    isTwoFactorRequired: boolean
  }

  const schema = yup.object().shape({
    isTwoFactorRequired: yup.boolean().required('You must choose to enable or disable 2FA'),
  })

  const { control, handleSubmit, errors } = useForm<Params>({
    resolver: yupResolver(schema),
  })

  const mutation = async (params: Params): Promise<User> => {
    const { data } = await axios.put(`/users/${user.id}/update_profile`, params)
    return data
  }

  const updateAccount = useMutation(mutation, {
    onSuccess: async (data) => {
      const twoFactorRequired = data.is_two_factor_required === true ? 'required' : 'not required'

      dispatch(setUser(data))
      showStatus(`Your personal two factor settings were changed to ${twoFactorRequired} `)
      history.push(USER_SECURITY_URL)
    },
  })

  const onSubmit = (data: Params) => {
    updateAccount.mutate(data)
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
      isLoading={updateAccount.isLoading}
      isError={updateAccount.isError}
      errorMessage="There was an error updating your two factor settings . Please try again."
    >
      <Grid container justify="center" alignItems="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-name-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container item xs={12} justify="center">
              <Grid item md={6} sm={6} xs={10}>
                <FormGroup>
                  <InputLabel htmlFor="isTwoFactorRequired" style={{ margin: '1rem auto' }}>
                    Update your two factor auth settings
                  </InputLabel>

                  <Grid container item justify="center" alignItems="center">
                    <Grid item>
                      <Controller
                        control={control}
                        id="isTwoFactorRequired"
                        name="isTwoFactorRequired"
                        defaultValue={user.is_two_factor_required}
                        render={({ value, onChange, ref }) => (
                          <Checkbox
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            value={value}
                            inputRef={ref}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>Require Two Factor</Typography>
                    </Grid>
                  </Grid>

                  {errors.isTwoFactorRequired?.message !== undefined && (
                    <Typography className={classes.validation}>
                      {errors.isTwoFactorRequired?.message}
                    </Typography>
                  )}
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
