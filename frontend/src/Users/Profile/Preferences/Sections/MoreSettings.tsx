import { useContext } from 'react'

/** Data */
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
    height: '10px',
  },
  label: {
    fontSize: '0.85rem',
  },
}))

export function MoreSettings() {
  const classes = useStyles()
  const { container: data } = useContext(PreferencesContext)

  return (
    <Grid container className={classes.root}>
      <TableContainer>
        <Table aria-label="recent activities">
          <TableHead>
            <TableRow className={classes.row}>
              <TableCell width="95%">
                <Typography variant="h2">More Settings</Typography>
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
                  <strong>(Account Preferences)</strong>
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Collapse Main Menu Bar</Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.preferenceOption('collapse-main-menu-bar')}
                      name="collapse-main-menu-bar"
                      color="primary"
                      size="small"
                      disabled
                    />
                  }
                  label={onOrOff(data.preferenceOption('collapse-main-menu-bar'))}
                />
              </TableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <strong>(Manage Cases)</strong>
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Hide Archived Cases</Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.preferenceOption('hide-archived-cases')}
                      name="hide-archived-cases"
                      color="primary"
                      size="small"
                      disabled
                    />
                  }
                  label={onOrOff(data.preferenceOption('hide-archived-cases'))}
                />
              </TableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Show Case Card View</Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.preferenceOption('show-case-card-view')}
                      name="show-case-card-view"
                      color="primary"
                      size="small"
                      disabled
                    />
                  }
                  label={onOrOff(data.preferenceOption('show-case-card-view'))}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
