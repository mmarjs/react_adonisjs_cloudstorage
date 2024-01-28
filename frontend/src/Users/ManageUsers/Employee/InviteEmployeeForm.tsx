import { useRef, useEffect, useContext } from 'react'

/** Data */
import InviteUserContainer from '../Containers/InviteUserContainter'
import useObserver from 'pojo-observer'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { StatusContext } from 'App/StatusProvider'
import { ManageUsersContext } from 'Users/ManageUsers/ManageUsersProvider'

/** Form */
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import PersonIcon from '@material-ui/icons/Person'
import MuiPhoneNumber from 'material-ui-phone-number'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Autocomplete from '@material-ui/lab/Autocomplete'

/** UI Components */
import CasePermissions from '../CasePermissions'
import { RelativeLoader } from 'UI'

/** Helpers */
import clsx from 'clsx'
import { useTheming, useAxios, checkKeyDown, isFieldError, formatRoleName } from 'Lib'
import toSafeInteger from 'lodash-es/toSafeInteger'

import { InviteUserForm, InviteUserParams, AccountRole } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  userIcon: {
    'fontSize': `${theme.spacing(5)}px`,
    '& > *': {
      fill: `${theme.palette.blue.main}`,
    },
  },
  title: {
    margin: '0 0 2rem 0',
  },
  newUser: {
    textDecoration: 'none',
    cursor: 'initial',
  },
  clickableNewUser: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  assignCases: {
    cursor: 'initial',
    textDecoration: 'none',
  },
  clickableAssignCases: {
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}))

export default function InviteEmployeeForm() {
  const axios = useAxios()
  const classes = useStyles()
  const theming = useTheming()
  const { showStatus } = useContext(StatusContext)
  const { manageUsers } = useContext(ManageUsersContext)
  const companyId = useSelector((state: AppState) => state.company.id)
  const companyName = useSelector((state: AppState) => state.company.name)
  const employeeContainer = useRef<InviteUserContainer>(
    new InviteUserContainer(axios, 'account-admin')
  )
  const data = useObserver(employeeContainer.current)

  useEffect(() => {
    data.loadReqs().then(() => {})
  }, [])

  useEffect(() => {
    if (data.successMessage !== '') {
      showStatus(data.successMessage)
    }

    if (data.errorMessage !== '') {
      showStatus(data.errorMessage, 'error')
    }

    if (data.isSuccess || data.isError) {
      manageUsers.employeeInviteModalOpen = false
    }
  }, [data.isSuccess, data.isError, data.successMessage, data.errorMessage])

  const schema = yup.object().shape({
    first_name: yup.string().required('A first name is required'),
    last_name: yup.string().required('A last name is required'),
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    phone: yup.string().optional(),
    role: yup.mixed().oneOf(['account-admin', 'case-manager']),
  })

  const { register, control, handleSubmit, errors } = useForm<InviteUserForm>({
    resolver: yupResolver(schema),
    shouldUnregister: false,
  })

  const roles: { role: AccountRole; title: string }[] = [
    { role: 'account-admin', title: 'Administrator' },
    { role: 'case-manager', title: 'Case Manager' },
  ]

  const onSubmit = (input: InviteUserForm) => {
    const params: InviteUserParams = {
      company_id: companyId,
      first_name: input.first_name,
      last_name: input.last_name,
      company_name: companyName,
      street: input?.street,
      state: data.state,
      city: input?.city,
      zip: toSafeInteger(input?.zip),
      phone: data.phone,
      email: input?.email,
      role: data.role,
      permitted_cases: data.permittedCases,
    }

    data.inviteUser(params).then(() => {
      manageUsers.loadUsers().then(() => {})
    })
  }

  if (data.isLoading) {
    return (
      <div style={{ marginTop: '10rem' }}>
        <RelativeLoader />
      </div>
    )
  }
  return (
    <Grid container item xs={12} justify="center">
      <Grid container xs={12} justify="center" alignItems="center" style={{ margin: '0.5rem 0' }}>
        <PersonIcon className={classes.userIcon} />
        <Typography
          variant="h1"
          color="secondary"
          className={clsx({
            [classes.newUser]: !data.showCases,
            [classes.clickableNewUser]: data.showCases,
          })}
          onClick={() => {
            if (data.showCases) {
              data.showCases = !data.showCases
            }
          }}
        >
          New Employee
        </Typography>
      </Grid>
      <form
        id="invite-user-form"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => checkKeyDown(e)}
      >
        <Grid container justify="center">
          {!data.showCases ? (
            <>
              <Grid
                container
                item
                xs={12}
                justify="center"
                alignItems="center"
                spacing={2}
                className={theming.row}
              >
                <Grid item sm={6} xs={12}>
                  <FormGroup>
                    <TextField
                      id="first_name"
                      name="first_name"
                      label="First Name"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.first_name?.message)}
                      helperText={errors.first_name?.message}
                    />
                  </FormGroup>
                </Grid>

                <Grid item sm={6} xs={12}>
                  <FormGroup>
                    <TextField
                      id="last_name"
                      name="last_name"
                      label="Last Name"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.last_name?.message)}
                      helperText={errors.last_name?.message}
                    />
                  </FormGroup>
                </Grid>
              </Grid>

              <Grid
                container
                item
                xs={12}
                justify="center"
                alignItems="center"
                spacing={2}
                className={theming.row}
              >
                <Grid item sm={6} xs={12}>
                  <FormGroup>
                    <TextField
                      id="street"
                      name="street"
                      label="Street address"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.street?.message)}
                      helperText={errors.street?.message}
                    />
                  </FormGroup>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <FormGroup>
                    <TextField
                      id="city"
                      name="city"
                      label="City"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.city?.message)}
                      helperText={errors.city?.message}
                    />
                  </FormGroup>
                </Grid>
              </Grid>

              <Grid
                container
                item
                xs={12}
                justify="center"
                alignItems="center"
                spacing={2}
                className={theming.row}
              >
                <Grid item sm={6} xs={12}>
                  <FormGroup>
                    <Autocomplete
                      id="state"
                      autoHighlight
                      value={data.state}
                      onChange={(event, newValue) => {
                        data.state = newValue ?? ''
                      }}
                      options={data.states.map((s) => s.name)}
                      style={{ width: '100%' }}
                      renderInput={(params) => (
                        <TextField {...params} label="States" variant="outlined" size="small" />
                      )}
                    />
                  </FormGroup>
                </Grid>

                <Grid item sm={6} xs={12}>
                  <FormGroup>
                    <TextField
                      id="zip"
                      name="zip"
                      placeholder="Zip"
                      type="number"
                      InputProps={{ inputProps: { min: 0, max: 99950 } }}
                      inputRef={register}
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.zip?.message)}
                      helperText={errors.zip?.message}
                    />
                  </FormGroup>
                </Grid>
              </Grid>

              <Grid
                container
                item
                xs={12}
                justify="center"
                alignItems="center"
                spacing={2}
                className={theming.row}
              >
                <Grid item sm={6} xs={12}>
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
                          value={data.phone}
                          onChange={(ev) => {
                            const next = String(ev)
                            data.phone = next
                          }}
                          className={theming.phoneField}
                          error={isFieldError(errors.phone?.message)}
                          helperText={errors.phone?.message}
                        />
                      )}
                    ></Controller>
                  </FormGroup>
                </Grid>
                <Grid item sm={6} xs={12} style={{ height: '4rem' }}>
                  <FormGroup>
                    <TextField
                      id="email"
                      name="email"
                      label="Email"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      className={theming.textField}
                      error={isFieldError(errors.email?.message)}
                      helperText={errors.email?.message}
                    />
                  </FormGroup>
                </Grid>
              </Grid>

              <Grid
                container
                item
                xs={12}
                justify="center"
                alignItems="center"
                spacing={2}
                className={theming.row}
              >
                <Grid item xs={12}>
                  <FormGroup>
                    <Autocomplete
                      id="role"
                      value={{ role: data.role, title: formatRoleName(data.role) }}
                      onChange={(event, newValue) => {
                        data.role = newValue?.role ?? 'case-manager'
                      }}
                      getOptionLabel={(option) => option.title}
                      options={roles}
                      style={{ width: '100%' }}
                      renderInput={(params) => (
                        <TextField {...params} label="Role" variant="outlined" size="small" />
                      )}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </>
          ) : (
            <>{data.role === 'case-manager' && <CasePermissions data={data} />}</>
          )}

          <Grid
            container
            item
            xs={12}
            justify="space-between"
            alignItems="center"
            style={{ margin: '1.5rem' }}
          >
            <Grid item>
              {data.role === 'case-manager' && (
                <Typography
                  variant="h1"
                  color="primary"
                  className={clsx({
                    [classes.newUser]: data.showCases,
                    [classes.clickableNewUser]: !data.showCases,
                  })}
                  onClick={() => (data.showCases = true)}
                >
                  Assign Cases
                </Typography>
              )}
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                type="submit"
                disabled={data.showCases}
              >
                Invite Employee
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Grid>
  )
}
