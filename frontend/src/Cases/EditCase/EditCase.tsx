import React, { useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

/** Data */
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { StatusContext } from 'App/StatusProvider'

/** Material UI */
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Button from '@material-ui/core/Button'
import FormGroup from '@material-ui/core/FormGroup'
import InputLabel from '@material-ui/core/InputLabel'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import FormHelperText from '@material-ui/core/FormHelperText'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'

/** UI */
import { Template, IconTitle } from 'UI'
import { CaseTitle } from 'Cases'
import CaseCardShield from '../CaseCardShield'

/** Helpers */
import dayjs from 'dayjs'
import { toInteger } from 'lodash-es'
import { Case, CaseStatusOption, QueryKey, CaseType, TimeZone, BreadCrumbLink } from 'types'
import { MANAGE_CASES_URL, CASE_URL, useAxios, useIsMounted, checkKeyDown, isFieldError } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2rem 2rem 1rem 2rem',
    width: '50%',
    [theme.breakpoints.up('xs')]: {
      width: '90%',
    },
    [theme.breakpoints.up('sm')]: {
      width: '70%',
    },
    border: '1px solid #5d5a5a',
    borderRadius: 0,
  },
  wrapper: {
    border: '2px',
    borderColor: 'black',
  },
  submit: {
    width: '100%',
  },
  details: {
    margin: '0 0 0 1rem',
  },
  caseDetails: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  detailsRow: {
    margin: '0 0 2rem 0',
  },
  group: {
    width: '95%',
  },
  statusOption: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  confirmDeleteAlert: {
    margin: '1rem 0',
  },
  caseIcon: {
    fontSize: '1.5rem',
  },
  archiveText: {
    margin: '0 0 0 1rem',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    color: `${theme.palette.danger.main}`,
  },
  clientName: {
    fontSize: '1rem',
    padding: '0.3rem 0',
  },
  evidenceItems: {
    fontSize: '0.9rem',
  },
  assignedUsers: {
    fontSize: '0.9rem',
    color: `${theme.palette.primary.main}`,
  },
  caseCardItem: {
    marginBottom: '0.2rem',
  },
  caseCaseItemInfo: {
    marginBottom: '2rem',
  },
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  calendarIcon: {
    width: '25px',
    paddingRight: '0.3rem',
  },
  divider: {
    height: '25px',
    width: '2px',
    backgroundColor: '#000000',
    marginTop: '8px',
    marginLeft: '10px',
  },
  caseFormFooter: {
    width: '70%',
    backgroundColor: '',
    borderTop: 0,
    border: '1px solid #5d5a5a',
  },
}))

interface ParamTypes {
  case_id: string
}

interface ScreenResponse {
  caseTypes: CaseType[]
  timeZones: TimeZone[]
  caseInstance: Case
}

type Inputs = {
  case_name: string
  client_name: string
  client_reference: string
  client_phone: string
  client_email: string
  case_type_id: number
  time_zone_id: number
  notes: string
  status: CaseStatusOption
}

interface UpdateParams {
  case_name: string
  client_name: string
  client_reference: string
  client_phone: string
  client_email: string
  case_type_id: number
  time_zone_id: number
  notes: string
  status: CaseStatusOption
  company_id: number
}

export function EditCase() {
  const { case_id } = useParams<ParamTypes>()
  const caseId = toInteger(case_id)
  const classes = useStyles()
  const axios = useAxios()
  const { setSafely } = useIsMounted()
  const history = useHistory()
  const { showStatus } = useContext(StatusContext)
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<CaseStatusOption>('active')
  const [confirmFailure, setConfirmFailure] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [updateFailed, setUpdateFailed] = useState(false)

  const screen = async (): Promise<ScreenResponse> => {
    const { data } = await axios.get(`/cases/${caseId}/show`)
    return data
  }

  const { isLoading, isError, data } = useQuery([QueryKey.showCaseScreen, caseId], screen, {
    onSuccess: (data) => {
      const c = data.caseInstance

      if (c?.status === 'active') {
        setSafely(setStatus, 'active')
      }

      if (c?.status === 'archived') {
        setSafely(setStatus, 'archive')
      }
    },
  })

  const caseInstance: Case | undefined = data?.caseInstance

  const caseTypes: CaseType[] = data?.caseTypes || []
  const timeZones: TimeZone[] = data?.timeZones || []

  const schema = yup.object().shape({
    caseName: yup.string().required('A case name is required'),
    clientName: yup.string().required('A client name is required'),
    clientReference: yup.string(),
    clientPhone: yup.string(),
    clientEmail: yup.string().email('An email is required'),
    caseTypeId: yup.number().required('A Case Type is required').positive().integer(),
    timeZoneId: yup.number().required('A Time Zone is required').positive().integer(),
    notes: yup.string(),
    status: yup.string().required('A status is required'),
  })

  const { register, control, handleSubmit, setValue, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const updateCase = async (params: UpdateParams): Promise<void> => {
    await axios.put(`/cases/${caseInstance?.id}/update`, params)
  }

  const mutation = useMutation(updateCase, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QueryKey.manageCaseScreen)

      showStatus('The case was successfully updated')
      history.push(MANAGE_CASES_URL)
    },
    onError: () => {
      reset()
      setSafely(setUpdateFailed, true)
    },
  })

  const onConfirmText = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const text = ev.target.value
    setSafely(setConfirmation, text)
  }

  const onSubmit = (data: Inputs) => {
    if (status === 'delete') {
      if (confirmation !== 'confirm') {
        setSafely(setConfirmFailure, true)
        return false
      }
    }

    const params: UpdateParams = { ...data, company_id: caseInstance?.company_id || 0 }
    params.status = status

    mutation.mutate(params)
  }

  const breadcrumbs: BreadCrumbLink[] = [
    {
      name: 'Manage Cases',
      href: MANAGE_CASES_URL,
    },
    {
      name: 'Update Case',
      href: `${CASE_URL}/${caseInstance?.id}/edit`,
    },
  ]

  const Title = () => (
    <IconTitle
      Icon={() => <BusinessCenterIcon className={classes.caseIcon} />}
      text={caseInstance?.case_name ?? 'Manage Cases'}
    />
  )

  return (
    <Template
      title={caseInstance?.case_name ?? 'Manage Cases'}
      TitleComponent={Title}
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      isError={isError || caseInstance === undefined}
      errorMessage="The case can not be edited at this time"
    >
      <Grid container direction="column" alignItems="center" item xs={12}>
        <Paper variant="outlined" elevation={1} className={classes.root}>
          <form
            id="update-case-form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => checkKeyDown(e)}
          >
            <Grid container className={classes.caseCaseItemInfo}>
              <Grid item sm={8} xs={12}>
                <CaseTitle caseInstance={caseInstance} limit={60} id />
                <Box className={classes.details}>
                  <Typography className={classes.clientName}>
                    Client Name: <strong>{caseInstance?.client_name}</strong>
                  </Typography>
                  <Typography className={classes.evidenceItems}>
                    Evidence Items: <strong>0</strong>
                  </Typography>
                  <Typography className={classes.assignedUsers}>
                    Assigned Users: <strong>0</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={4} xs={12}>
                <Box className={classes.caseCardItem}>
                  <CaseCardShield item={caseInstance} id={false} />
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  type="submit"
                  className={classes.submit}
                >
                  Confirm Update
                </Button>
              </Grid>
            </Grid>
            {updateFailed && (
              <Grid
                container
                item
                xs={12}
                spacing={2}
                justify="center"
                className={classes.confirmDeleteAlert}
              >
                <Grid item sm={8} xs={12}>
                  <Alert severity="error">
                    The case could not be updated at this time. Please try again.
                  </Alert>
                </Grid>
              </Grid>
            )}

            <Grid container item justify="center" alignItems="center">
              <Grid item sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="caseName">Case Name</InputLabel>
                  <TextField
                    inputRef={register}
                    id="caseName"
                    name="caseName"
                    type="text"
                    variant="outlined"
                    size="small"
                    defaultValue={caseInstance?.case_name}
                    error={isFieldError(errors.case_name?.message)}
                    helperText={errors.case_name?.message}
                  />
                </FormGroup>
              </Grid>
              <Grid sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="clientName">Client Name</InputLabel>
                  <TextField
                    inputRef={register}
                    id="clientName"
                    name="clientName"
                    type="text"
                    variant="outlined"
                    size="small"
                    defaultValue={caseInstance?.client_name}
                    error={isFieldError(errors.client_name?.message)}
                    helperText={errors.client_name?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item justify="center" alignItems="center">
              <Grid sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="clientReference">Client Matter Number</InputLabel>
                  <TextField
                    inputRef={register}
                    id="clientReference"
                    name="clientReference"
                    type="text"
                    variant="outlined"
                    size="small"
                    defaultValue={caseInstance?.client_reference}
                    error={isFieldError(errors.client_reference?.message)}
                    helperText={errors.client_reference?.message}
                  />
                </FormGroup>
              </Grid>
              <Grid sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="clientEmail">Client Email</InputLabel>
                  <TextField
                    inputRef={register}
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    variant="outlined"
                    size="small"
                    defaultValue={caseInstance?.client_email}
                    error={isFieldError(errors.client_email?.message)}
                    helperText={errors.client_email?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item alignItems="center">
              <Grid sm={6} xs={12}>
                <Typography className={classes.caseDetails}>Case Details</Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="clientPhone">Client Phone</InputLabel>
                  <TextField
                    inputRef={register}
                    id="clientPhone"
                    name="clientPhone"
                    type="phone"
                    variant="outlined"
                    size="small"
                    defaultValue={caseInstance?.client_phone}
                    error={isFieldError(errors.client_phone?.message)}
                    helperText={errors.client_phone?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item justify="center" alignItems="center">
              <Grid sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="caseTypeId">Case Type</InputLabel>
                  <Controller
                    as={Select}
                    native
                    id="caseTypeId"
                    name="caseTypeId"
                    control={control}
                    defaultValue={caseInstance?.case_type_id}
                  >
                    <option value={0}>Select Case Type</option>
                    {caseTypes ? (
                      caseTypes.map((caseType, i) => (
                        <option key={i} value={caseType.id}>
                          {caseType.name}
                        </option>
                      ))
                    ) : (
                      <option key={100} value="1">
                        General
                      </option>
                    )}
                  </Controller>
                  <FormHelperText error={isFieldError(errors.case_type_id?.message)}>
                    {errors.case_type_id?.message}
                  </FormHelperText>
                </FormGroup>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormGroup className={classes.group}>
                  <InputLabel htmlFor="timeZoneId">Time Zone</InputLabel>
                  <Controller
                    as={Select}
                    native
                    id="timeZoneId"
                    name="timeZoneId"
                    control={control}
                    defaultValue={caseInstance?.time_zone_id}
                  >
                    <option value={0}>Select A Time Zone</option>
                    {timeZones ? (
                      timeZones.map((timeZone, i) => (
                        <option key={i} value={timeZone.id}>
                          {timeZone.local}
                        </option>
                      ))
                    ) : (
                      <option key={50} value={1}>
                        PST
                      </option>
                    )}
                  </Controller>
                  <FormHelperText error={isFieldError(errors.time_zone_id?.message)}>
                    {errors.time_zone_id?.message}
                  </FormHelperText>
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12}>
              <Grid item xs={12}>
                <FormGroup>
                  <InputLabel htmlFor="notes">Investigator Notes</InputLabel>
                  <TextField
                    inputRef={register}
                    id="notes"
                    name="notes"
                    multiline
                    rows={2}
                    variant="outlined"
                    defaultValue={caseInstance?.notes}
                    error={isFieldError(errors.notes?.message)}
                    helperText={errors.notes?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} spacing={2} justify="center" alignItems="center">
              <Grid item sm={4} xs={12}>
                <FormGroup>
                  <InputLabel htmlFor="status">Status</InputLabel>

                  <Controller
                    control={control}
                    id="status"
                    name="status"
                    defaultValue={caseInstance?.status}
                    render={({ onChange, ref }) => (
                      <Select
                        native
                        onChange={(e) => {
                          setSafely(setStatus, e.target.value)
                          setValue('status', e.target.value)
                        }}
                        value={status}
                        inputRef={ref}
                      >
                        <option aria-label="None" value="">
                          Select Case Id
                        </option>
                        <option value="active">Active</option>
                        <option value="archive">Archive</option>
                        <option value="delete">Delete</option>
                      </Select>
                    )}
                  ></Controller>
                  <FormHelperText error={isFieldError(errors.status?.message)}>
                    {errors.status?.message}
                  </FormHelperText>
                </FormGroup>
              </Grid>
              <Grid item sm={8} xs={12}>
                {status === 'archive' && (
                  <Typography className={classes.archiveText}>
                    <strong>NOTE:</strong> All case evidence acquisitions will be archived. You may
                    reactivate the entire case or individual evidence items at anytime in the
                    future. However, a reactivation fee of $50.00 will be applied at time of
                    reactivation
                  </Typography>
                )}
                {status === 'delete' && (
                  <FormGroup style={{ margin: '1.1rem 0 0 0' }}>
                    <TextField
                      id="confirm-delete"
                      name="confirm-delete"
                      variant="outlined"
                      size="small"
                      value={confirmation}
                      onChange={onConfirmText}
                      placeholder="Please type the word confirm to delete your case"
                    />
                  </FormGroup>
                )}
              </Grid>
            </Grid>

            {confirmFailure && (
              <Grid
                container
                item
                xs={12}
                spacing={2}
                justify="center"
                className={classes.confirmDeleteAlert}
              >
                <Grid item sm={4}></Grid>
                <Grid item sm={8} xs={12}>
                  <Alert severity="error">
                    You must type the word <strong>confirm</strong> in the box above to delete this
                    case.
                  </Alert>
                </Grid>
              </Grid>
            )}
          </form>
        </Paper>
        <Box px={2} py={1} className={classes.caseFormFooter}>
          <Typography color="textPrimary" className={classes.wrapIcon}>
            <CalendarTodayIcon className={classes.calendarIcon} />
            {`Created: ${dayjs(caseInstance?.created_at).format('MM/DD/YYYY')}, by:
              ${caseInstance?.createdBy?.first_name} ${caseInstance?.createdBy?.last_name}`}
          </Typography>
        </Box>
      </Grid>
    </Template>
  )
}
