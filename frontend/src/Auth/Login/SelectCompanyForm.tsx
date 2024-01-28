import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { RoleCompany } from 'types'
import { FormGroup } from '@material-ui/core'

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
  field: {
    margin: '3rem 0',
  },
  error: {
    margin: '0.5rem 0',
    color: `${theme.palette.error.main}`,
  },
}))

interface Props {
  processNeedTwoFactor: (companyId: number) => void
  companies: RoleCompany[]
  storeSelectedCompany: (company: RoleCompany) => void
}

export default function SelectCompanyForm(props: Props) {
  const classes = useStyles()
  const { processNeedTwoFactor, companies, storeSelectedCompany } = props
  const o_companies = companies.filter((element, index) => index === 0)
  let p_companies = companies.filter((element, index) => index !== 0)
  p_companies.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
  const companyData = [...o_companies, ...p_companies]

  interface Params {
    companyId: number
  }

  const loginSchema = yup.object().shape({
    companyId: yup.number().required('A company is required'),
  })

  const { control, handleSubmit, errors } = useForm<Params>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = (params: Params) => {
    const company = companies.find((a) => a.id === params.companyId) as RoleCompany

    storeSelectedCompany(company)

    processNeedTwoFactor(company.id)
  }

  return (
    <>
      <Grid container justify="center" spacing={2}>
        <Grid container item md={6} sm={9} xs={12}>
          <Paper elevation={2} className={classes.paper}>
            <Typography variant="h3" align="center">
              Welcome to Evidence Locker
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
                  {companyData.map((company, i) => (
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
              >
                Select Company
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}
