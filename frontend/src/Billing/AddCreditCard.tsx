import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useDispatch } from 'react-redux'
import { setBillingStatus } from 'Data/Company'
import { StatusContext } from 'App/StatusProvider'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

/** UI */
import { MANAGE_CASES_URL } from 'Lib'
import { Template } from 'UI'

export function AddCreditCard() {
  const dispatch = useDispatch()
  const history = useHistory()
  const { showStatus } = useContext(StatusContext)

  const updateCompany = () => {
    dispatch(setBillingStatus('active'))
    showStatus('Your account is now active')
    history.push(MANAGE_CASES_URL)
  }

  return (
    <Template title="Add Credit Card">
      <Grid container justify="center">
        <Grid container item sm={6} xs={12} justify="center">
          <Grid item xs={6}>
            <Button variant="contained" color="primary" onClick={updateCompany}>
              Activate Account
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Template>
  )
}
