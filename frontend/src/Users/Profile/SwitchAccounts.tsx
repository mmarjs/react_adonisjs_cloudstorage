import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery, useMutation } from 'react-query'
import { AppState } from 'App/reducers'
import Grid from '@material-ui/core/Grid'
import { IconTitle, Template } from 'UI'
import BusinessIcon from '@material-ui/icons/Business'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { RoleCompany, QueryKey, FetchLoginDataResponse } from 'types'
import { HOME_URL, useAxios, clamp } from 'Lib'
import useLogin from 'Auth/Login/useLogin'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '2rem',
    border: '1px',
    borderColor: '#efe',
    borderRadius: '3rem',
    width: '400px',
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
    margin: 'auto',
  },
  businessIcon: {
    'fontSize': '1.7rem',
    '& > *': {
      fill: `#094e2c`,
    },
  },
  field: {
    margin: '3rem 0',
  },
  error: {
    margin: '0.5rem 0',
    color: `${theme.palette.error.main}`,
  },
  companyName: {
    margin: '0.5rem 0',
  },
}))

export function SwitchAccounts() {
  const classes = useStyles()
  const axios = useAxios()
  const history = useHistory()
  const { storeLoginData } = useLogin()
  const hasMultipleCompanies = useSelector((state: AppState) => state.company.has_multiple)
  const companyName = useSelector((state: AppState) => state.company.name)
  const [errorMessage, setErrorMessage] = useState<undefined | string>()

  const [companyData, setCompanyData] = useState<RoleCompany[]>([])

  useEffect(() => {
    if (!hasMultipleCompanies) {
      history.goBack()
    }
  }, [hasMultipleCompanies, history])

  interface Params {
    companyId: number
  }

  const screen = async (): Promise<RoleCompany[]> => {
    const { data } = await axios.get('/company/switch')
    return data
  }

  const { isLoading: screenIsLoading, isError: screenIsError } = useQuery(
    QueryKey.switchCompanyScreen,
    screen,
    {
      onSuccess: (data) => {
        const o_companies = data.filter((element, index) => index === 0)
        let p_companies = data.filter((element, index) => index !== 0)
        p_companies.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
        const companyData = [...o_companies, ...p_companies]
        setCompanyData(companyData)
      },
      onError: () => {
        setErrorMessage('Failed to load accounts.')
      },
    }
  )

  const action = async (params: Params): Promise<FetchLoginDataResponse> => {
    const { data } = await axios.post('switch_company', params)
    return data
  }

  const switchCompany = useMutation(action, {
    onSuccess: (data) => {
      storeLoginData(data)
      history.push(HOME_URL)
    },
    onError: () => {
      setErrorMessage(
        'We are not able to switch your account at the moment. You can try again or logout and select your desired account upon login.'
      )
    },
  })

  const schema = yup.object().shape({
    companyId: yup.number().required('A company is required'),
  })

  const { control, handleSubmit, errors } = useForm<Params>({
    resolver: yupResolver(schema),
  })

  const onSubmit = (params: Params) => {
    switchCompany.mutate(params)
  }

  const Title = () => (
    <IconTitle Icon={() => <BusinessIcon className={classes.businessIcon} />} text="Account Info" />
  )

  return (
    <Template
      title="Switch Company Accounts"
      TitleComponent={Title}
      isLoading={screenIsLoading || switchCompany.isLoading}
      isError={screenIsError || switchCompany.isError}
      errorMessage={errorMessage}
    >
      <Grid container justify="center" spacing={2}>
        <Grid container item md={6} sm={9} xs={12}>
          <Paper elevation={2} className={classes.paper}>
            <Typography variant="h3" align="center">
              Select an Account
            </Typography>

            <Typography align="center" className={classes.companyName}>
              Current: {clamp(companyName, 80)}
            </Typography>

            <form id="select-company-form" onSubmit={handleSubmit(onSubmit)}>
              <FormGroup className={classes.field}>
                <Controller
                  as={Select}
                  native
                  id="companyId"
                  name="companyId"
                  control={control}
                  error={errors?.companyId !== undefined}
                >
                  <option value={0}>Select a Company Account</option>
                  {companyData &&
                    companyData.map((company, i) => (
                      <option
                        key={i}
                        value={company.id}
                        style={{ fontWeight: i === 0 ? 'bold' : 'normal' }}
                      >
                        {company.name}
                      </option>
                    ))}
                </Controller>

                {errors?.companyId !== undefined && (
                  <Typography className={classes.error}>Please Select a Company</Typography>
                )}
              </FormGroup>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                className="form-button-spacing"
                data-cy="submit"
                disabled={switchCompany.isError}
              >
                Select Company
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Template>
  )
}
