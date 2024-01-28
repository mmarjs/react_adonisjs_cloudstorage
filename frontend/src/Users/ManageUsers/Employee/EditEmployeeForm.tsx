import { useRef, useEffect, useContext } from 'react'

/** Data */
import EditUserContainer from '../Containers/EditUserContainer'
import useObserver from 'pojo-observer'
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
import Alert from '@material-ui/lab/Alert'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import makeStyles from '@material-ui/core/styles/makeStyles'
import InputLabel from '@material-ui/core/InputLabel'
import PersonIcon from '@material-ui/icons/Person'
import MuiPhoneNumber from 'material-ui-phone-number'
import Autocomplete from '@material-ui/lab/Autocomplete'

/** UI Components */
import { RelativeLoader } from 'UI'
import CasePermissions from '../CasePermissions'

/** Helpers */
import clsx from 'clsx'
import { useTheming, useAxios, checkKeyDown, isFieldError, formatRoleName } from 'Lib'

import { AccountRole, UpdateUserForm, UserStatus } from 'types'

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
  table: {
    minWidth: 650,
  },
  thead: {
    color: '#fff',
  },
  th: {
    padding: '0.5rem 0.5rem 0.5rem 1.5px',
    color: '#fff',
    backgroundColor: `${theme.palette.primary.main}`,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  container: {
    maxHeight: 250,
  },
  checkbox: {
    padding: '0 0 0 1px',
  },
  custodianCheckbox: {
    padding: '0 10px 0 1px',
  },
  checkboxColumn: {
    width: '50px',
  },
  caseIcon: {
    fontSize: '1.5rem',
    margin: '0 0.5rem 0 0',
  },
  roleTableTitle: {
    'color': theme.palette.primary.main,
    'margin': '0 0 0rem 0',
    '& path': {
      fill: theme.palette.primary.main,
    },
  },
  phone: {
    '& input': {
      height: '1rem',
    },
  },
  expand: {
    'fontSize': '1rem',
    '& path': {
      fill: `${theme.palette.primary.main}`,
    },
  },
  hide: {
    'fontSize': '1rem',
    '& path': {
      fill: `${theme.palette.primary.main}`,
    },
  },
  caseManagerTitleRow: {
    margin: '0 0 0 0',
  },
  evidenceUserTitleRow: {
    margin: '0 0 0 0',
  },
  formGroup: {},
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

export default function EditClientForm() {
  const axios = useAxios()
  const { manageUsers } = useContext(ManageUsersContext)
  const editUserContainer = useRef<EditUserContainer>(
    new EditUserContainer(manageUsers.userId, axios)
  )
  const data = useObserver(editUserContainer.current)
  const classes = useStyles()
  const theming = useTheming()
  const { showStatus } = useContext(StatusContext)

  useEffect(() => {
    data.loadUser().then(() => {})
  }, [])

  useEffect(() => {
    if (data.successMessage !== '') {
      showStatus(data.successMessage)
    }

    if (data.errorMessage !== '') {
      showStatus(data.errorMessage, 'error')
    }

    if (data.isSuccess || data.isError) {
      manageUsers.employeeEditModalOpen = false
    }
  }, [data.isSuccess, data.isError, data.successMessage, data.errorMessage])

  const schema = yup.object().shape({
    first_name: yup.string().required('A first name is required'),
    last_name: yup.string().required('A last name is required'),
    company_name: yup.string().optional(),
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional().nullable(),
    phone: yup.string().optional(),
    role: yup.mixed().oneOf(['account-admin', 'case-manager']),
  })

  const { register, control, handleSubmit, errors } = useForm<UpdateUserForm>({
    resolver: yupResolver(schema),
    shouldUnregister: true,
  })

  const roles: { role: AccountRole; title: string }[] = [
    { role: 'account-admin', title: 'Administrator' },
    { role: 'case-manager', title: 'Case Manager' },
  ]

  const onSubmit = () => {
    data.updateUser().then((res) => {
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
          Edit Employee
        </Typography>
      </Grid>
      <form
        id="update-user-form"
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
                      value={data.firstName}
                      onChange={(ev) => {
                        data.firstName = ev.currentTarget.value
                      }}
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
                      value={data.lastName}
                      onChange={(ev) => {
                        data.lastName = ev.currentTarget.value
                      }}
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
                    <TextField
                      id="company_name"
                      name="company_name"
                      label="Company Name"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.company_name?.message)}
                      helperText={errors.company_name?.message}
                      value={data.companyName}
                      onChange={(ev) => {
                        data.companyName = ev.currentTarget.value
                      }}
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
                      label="Street Address"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.street?.message)}
                      helperText={errors.street?.message}
                      value={data.street}
                      onChange={(ev) => {
                        data.street = ev.currentTarget.value
                      }}
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
                      value={data.city}
                      onChange={(ev) => {
                        data.city = ev.currentTarget.value
                      }}
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
                      label="Zip"
                      type="number"
                      InputProps={{ inputProps: { min: 0, max: 99950 } }}
                      inputRef={register}
                      variant="outlined"
                      size="small"
                      error={isFieldError(errors.zip?.message)}
                      helperText={errors.zip?.message}
                      value={data.zip}
                      onChange={(ev) => {
                        data.zip = Number(ev.currentTarget.value)
                      }}
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
                      disabled={data.status === 'invited'}
                      className={theming.textField}
                      error={isFieldError(errors.email?.message)}
                      helperText={errors.email?.message}
                      value={data.email}
                      onChange={(ev) => {
                        data.email = ev.currentTarget.value
                      }}
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

              {data.status === 'invited' ? (
                <Grid container className={theming.row}>
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <strong>Status: </strong>
                      {data?.status}
                    </Alert>
                    <input
                      ref={register}
                      id="status"
                      name="status"
                      type="hidden"
                      value={data?.status}
                    />
                  </Grid>
                </Grid>
              ) : (
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
                      <InputLabel htmlFor="status">Status</InputLabel>
                      <Select
                        native
                        id="status"
                        name="status"
                        placeholder="Status"
                        value={data.status}
                        onChange={(e) => {
                          data.status = e.currentTarget.value as UserStatus
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="deleted">Delete</option>
                      </Select>
                    </FormGroup>
                  </Grid>
                </Grid>
              )}
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
                    [classes.assignCases]: data.showCases,
                    [classes.clickableAssignCases]: !data.showCases,
                  })}
                  onClick={() => {
                    data.showCases = !data.showCases
                  }}
                >
                  Assigned Cases
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
                {data?.status === 'invited' ? (
                  <div>Resend Invitation</div>
                ) : (
                  <div>Update Employee</div>
                )}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Grid>
  )
}
