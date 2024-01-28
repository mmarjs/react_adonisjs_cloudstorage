import { useContext } from 'react'

/** Data */
import { useDispatch } from 'react-redux'
import { setCompany } from 'Data/Company'
import { StatusContext, StatusStore } from 'App/StatusProvider'
import { PreferencesContext } from 'Users/Profile/Preferences/PreferencesProvider'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Switch from '@material-ui/core/Switch'
import MuiTableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import FormControlLabel from '@material-ui/core/FormControlLabel'

/** UI */
import { onOrOff } from 'Lib'

const TableCell = withStyles({
  root: {
    borderBottom: 'none',
    padding: '4px',
  },
})(MuiTableCell)

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '1rem',
  },
  capitalize: {
    'text-transform': 'capitalize',
  },
  row: {
    height: '20px',
  },
  label: {
    fontSize: '0.85rem',
  },
}))

export function AccountInfo() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { showStatus } = useContext(StatusContext) as StatusStore
  const { container, company } = useContext(PreferencesContext)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const state = event.target.checked
    container
      .saveCompanySetting(company.id, { isTwoFactorRequired: state })
      .then((res) => {
        if (res !== null) {
          dispatch(setCompany(res))
          showStatus(container.successMessage, 'success')
        }
      })
      .catch((err) => {
        showStatus(container.errorMessage, 'error')
      })
  }

  return (
    <Grid container className={classes.root}>
      <TableContainer>
        <Table aria-label="recent activities">
          <TableHead>
            <TableRow className={classes.row}>
              <TableCell width="95%">
                <Typography variant="h2">Account Info</Typography>
              </TableCell>
              <TableCell align="right">
                <strong>Default</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  <strong>(Company Account)</strong>
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Account Status: {'Active'}</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography>
                  <strong>(Global Settings)</strong>
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Enforce two-factor authentication</Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={company.is_two_factor_required}
                      onChange={handleChange}
                      name="is-two-factor-required"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(company.is_two_factor_required)}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
