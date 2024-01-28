import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { AppState } from 'App/reducers'
import { StatusContext } from 'App/StatusProvider'
import { useMutation } from 'react-query'
import { useSelector } from 'react-redux'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import makeStyles from '@material-ui/core/styles/makeStyles'
import SecurityIcon from '@material-ui/icons/Security'

/** UI */

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ShareUpdateLinkBody } from './../types'
import { useAxios, SHARE_SECURE_URL, isFieldError } from 'Lib'
import { ShareTemplate, IconTitle } from 'UI'

const useStyles = makeStyles((theme) => ({
  row: {
    margin: `${theme.spacing(3)}px 0`,
  },
  title: {
    fontSize: '2rem',
    margin: `0 0 ${theme.spacing(8)}px 0`,
  },
  securityIcon: {
    'fontSize': `40px`,
    '& > *': {
      fill: `#b98f04`,
    },
  },
}))

export function SharePasswordForm() {
  const classes = useStyles()
  const axios = useAxios()
  const history = useHistory()
  const shareLink = useSelector((state: AppState) => state.share.shareLink)
  const { showStatus } = useContext(StatusContext)

  type Inputs = {
    password: string
    password_confirmation: string
  }

  const schema = yup.object().shape({
    password: yup
      .string()
      .min(8, 'The password must be at least 8 characters long')
      .required('A password is required'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password'), null], 'The passwords must match'),
  })

  const { register, handleSubmit, errors, reset } = useForm<Inputs>({
    resolver: yupResolver(schema),
  })

  const action = async (params: object): Promise<void> => {
    const { data } = await axios.put(`/share/update_link/${params['linkId']}`, params['updateData'])
    return data
  }

  const mutationUpdateShareLink = useMutation(action, {
    onSuccess: async (data) => {
      showStatus('Your password was updated')
      history.push(SHARE_SECURE_URL)
    },
    onError: () => {
      reset()
    },
  })

  const onSubmit = async (data: Inputs) => {
    const params: ShareUpdateLinkBody = {
      linkId: shareLink.id,
      updateData: {
        expiry: shareLink.expires_at ? shareLink.expires_at : undefined,
        password: data.password,
        resend: false,
      },
    }
    mutationUpdateShareLink.mutate(params)
  }

  const Title = () => (
    <IconTitle
      Icon={() => <SecurityIcon className={classes.securityIcon} />}
      text="Reset Password"
    />
  )

  return (
    <ShareTemplate
      title="Reset Password"
      TitleComponent={Title}
      isLoading={mutationUpdateShareLink.isLoading}
      isError={mutationUpdateShareLink.isError}
      errorMessage="There was an error updating your password. Please try again soon."
    >
      <Grid container justify="center">
        <Paper style={{ width: '50%', padding: '3rem' }}>
          <form id="update-user-email-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="password"
                    name="password"
                    label="Password"
                    variant="outlined"
                    type="password"
                    error={isFieldError(errors.password?.message)}
                    helperText={errors.password?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center">
              <Grid item sm={6} xs={10}>
                <FormGroup>
                  <TextField
                    inputRef={register}
                    id="password_confirmation"
                    name="password_confirmation"
                    label="Password Confirmation"
                    variant="outlined"
                    type="password"
                    error={isFieldError(errors.password_confirmation?.message)}
                    helperText={errors.password_confirmation?.message}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <Grid container item xs={12} justify="center" alignItems="center">
              <Grid item sm={6} xs={10}>
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
    </ShareTemplate>
  )
}
