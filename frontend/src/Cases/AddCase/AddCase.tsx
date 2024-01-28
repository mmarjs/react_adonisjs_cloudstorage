import { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useSelector } from 'react-redux'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { AppState } from 'App/reducers'
import { StatusContext } from 'App/StatusProvider'

/** Material UI */
import Paper from '@material-ui/core/Paper'
import makeStyles from '@material-ui/core/styles/makeStyles'
import FormGroup from '@material-ui/core/FormGroup'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'

/** UI */
import { Template } from 'UI'
import MuiPhoneNumber from 'material-ui-phone-number'
import { Case, QueryKey, TimeZone, CaseType, BreadCrumbLink } from 'types'
import { useAxios, useIsMounted } from 'Lib'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

/** Helpers */
import { MANAGE_CASES_URL, isFieldError, ADD_CASE_URL } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2rem',
    width: '50%',
    [theme.breakpoints.up('xs')]: {
      width: '90%',
    },
    [theme.breakpoints.up('sm')]: {
      width: '70%',
    },
  },
  business: {
    fontSize: '3rem',
  },
  top: {
    padding: '0 0 1rem 0',
  },
  details: {
    paddingBottom: '15px',
  },
}))

interface ScreenResponse {
  caseTypes: CaseType[]
  timeZones: TimeZone[]
}

export function AddCase() {
  const classes = useStyles()
  const history = useHistory()
  const { showStatus } = useContext(StatusContext)
  const axios = useAxios()
  const queryClient = useQueryClient()
  const { setSafely } = useIsMounted()
  const companyId = useSelector((state: AppState) => state.company.id)
  const userId = useSelector((state: AppState) => state.user.id)
  const [clientPhone, setClientPhone] = useState('')

  const screen = async (): Promise<ScreenResponse> => {
    const { data } = await axios.get('/cases/reqs')
    return data
  }

  const { isLoading, data } = useQuery(QueryKey.caseFormScreen, screen)

  const storeCase = async (params: object): Promise<Case> => {
    const { data } = await axios.post('/cases/store', params)
    return data
  }

  const mutation = useMutation(storeCase, {
    onSuccess: (data) => {
      queryClient.invalidateQueries([QueryKey.manageCaseScreen, QueryKey.newUserScreen])
      showStatus('The case was successfully added!')

      history.push(MANAGE_CASES_URL)
    },
  })

  type Inputs = {
    caseName: string
    clientName: string
    clientReference: string
    clientPhone: string
    clientEmail: string
    caseTypeId: number
    timeZoneId: number
    notes: string
  }

  const schema = yup.object().shape({
    caseName: yup.string().required('A case name is required'),
    clientName: yup.string().required('A client name is required'),
    clientReference: yup.string(),
    clientPhone: yup.string(),
    clientEmail: yup.string().email('An email is required'),
    caseTypeIdd: yup.string(),
    timeZoneId: yup.string(),
    notes: yup.string(),
  })

  const { register, control, handleSubmit, errors } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const onSubmit = (data: Inputs) => {
    const params = { ...data, companyId: companyId, createdById: userId }
    params['clientPhone'] = clientPhone
    mutation.mutate(params)
  }

  const caseTypes: CaseType[] = data?.caseTypes || []
  const timeZones: TimeZone[] = data?.timeZones || []

  const breadcrumbs: BreadCrumbLink[] = [
    {
      name: 'Manage Cases',
      href: MANAGE_CASES_URL,
    },
    {
      name: 'New Case',
      href: ADD_CASE_URL,
    },
  ]

  return (
    <Template
      title="Manage Cases"
      breadcrumbs={breadcrumbs}
      isLoading={isLoading || mutation.isLoading}
      isError={mutation.isError}
      errorMessage="The case could not be added at this time. Please try again."
    >
      <Grid container item xs={12} justify="center">
        <Paper variant="outlined" elevation={1} className={classes.root}>
          <form id="add-case-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container justify="flex-start" alignItems="center" className={classes.top}>
              <Grid item xs={1}>
                <BusinessCenterIcon className={classes.business} />
              </Grid>
              <Grid item xs={11}>
                <Typography variant="h3" align="left">
                  Case &amp; Client Details
                </Typography>
              </Grid>
            </Grid>

            <Grid container item justify="center" alignItems="center" spacing={1}>
              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="caseName"
                    name="caseName"
                    type="text"
                    variant="outlined"
                    size="small"
                    label="Case Name"
                    error={isFieldError(errors.caseName?.message)}
                    helperText={errors.caseName?.message}
                  />
                </FormGroup>
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="clientName"
                    name="clientName"
                    type="text"
                    variant="outlined"
                    size="small"
                    label="Client Name"
                    error={isFieldError(errors.clientName?.message)}
                    helperText={errors.clientName?.message}
                  />
                </FormGroup>
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="clientReference"
                    name="clientReference"
                    type="text"
                    variant="outlined"
                    size="small"
                    label="Client Matter Number"
                    error={isFieldError(errors.clientReference?.message)}
                    helperText={errors.clientReference?.message}
                  />
                </FormGroup>
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    variant="outlined"
                    size="small"
                    label="Client Email"
                    error={isFieldError(errors.clientEmail?.message)}
                    helperText={errors.clientEmail?.message}
                  />
                </FormGroup>
              </Grid>

              <Grid item sm={6} xs={12}>
                <Typography className={classes.details}>
                  <strong>Case Details</strong>
                </Typography>
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <Controller
                    control={control}
                    id="clientPhone"
                    name="clientPhone"
                    defaultValue=""
                    render={() => (
                      <MuiPhoneNumber
                        defaultCountry={'us'}
                        regions={['north-america']}
                        id="clientPhone"
                        name="clientPhone"
                        label="Client Phone"
                        variant="outlined"
                        size="small"
                        value={clientPhone}
                        onChange={(ev) => {
                          const next = String(ev)
                          setSafely(setClientPhone, next)
                        }}
                        error={isFieldError(errors?.clientPhone?.message)}
                        helperText={errors?.clientPhone?.message}
                      />
                    )}
                  />
                </FormGroup>
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <InputLabel htmlFor="case_type_id">Case Type</InputLabel>
                  <Controller
                    as={Select}
                    native
                    control={control}
                    id="caseTypeId"
                    name="caseTypeId"
                    defaultValue="1"
                    error={isFieldError(errors.caseTypeId?.message)}
                  >
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
                  <FormHelperText error={isFieldError(errors?.caseTypeId?.message)}>
                    {errors?.caseTypeId?.message}
                  </FormHelperText>
                </FormGroup>
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormGroup>
                  <InputLabel htmlFor="timeZoneId">Time Zone</InputLabel>
                  <Controller
                    as={Select}
                    native
                    control={control}
                    id="timeZoneId"
                    name="timeZoneId"
                    defaultValue="1"
                    error={isFieldError(errors?.timeZoneId?.message)}
                  >
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
                  <FormHelperText error={isFieldError(errors?.timeZoneId?.message)}>
                    {errors?.timeZoneId?.message}
                  </FormHelperText>
                </FormGroup>
              </Grid>
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
                    error={isFieldError(errors.notes?.message)}
                    helperText={errors.notes?.message}
                  />
                </FormGroup>
              </Grid>

              <Button variant="contained" fullWidth color="primary" type="submit">
                Create
              </Button>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Template>
  )
}
