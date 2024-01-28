import { useContext } from 'react'

/** Data */
import { useDispatch } from 'react-redux'
import { setNotificationSettings } from 'Data/NotificationSettings'
import { StatusContext } from 'App/StatusProvider'
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
import { onOrOff, admins } from 'Lib'
import { EventName } from 'types'

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

export function Notifications() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { showStatus } = useContext(StatusContext)
  const { container: data, role } = useContext(PreferencesContext)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const name = event.target.name as EventName
    const plainValue = event.target.value as 'app' | 'email'
    const column = plainValue === 'app' ? 'sendApp' : 'sendEmail'

    data
      .saveNotificationSetting(name, { column, value: checked })
      .then((res) => {
        dispatch(setNotificationSettings(data.settings))
        showStatus(data.successMessage, 'success')
      })
      .catch((err) => {
        showStatus(data.errorMessage, 'error')
      })
  }

  return (
    <Grid container className={classes.root}>
      <TableContainer>
        <Table aria-label="recent activities">
          <TableHead>
            <TableRow>
              <TableCell width="90%">
                <Typography variant="h2">Notification Settings</Typography>
              </TableCell>
              <TableCell width="5%" align="right">
                <strong>In App</strong>
              </TableCell>
              <TableCell width="5%" align="right">
                <strong>Email</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>
                  <strong>(Case Info)</strong>
                </Typography>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when a new case is created
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('case-created', 'app')}
                      onChange={handleChange}
                      name="case-created"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('case-created', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('case-created', 'email')}
                      onChange={handleChange}
                      name="case-created"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('case-created', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Notify me when a case is deleted</Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('case-deleted', 'app')}
                      onChange={handleChange}
                      name="case-deleted"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('case-deleted', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('case-deleted', 'email')}
                      onChange={handleChange}
                      name="case-deleted"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('case-deleted', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>Notify me when a case is archived</Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('case-archived', 'app')}
                      onChange={handleChange}
                      name="case-archived"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('case-archived', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('case-archived', 'email')}
                      onChange={handleChange}
                      name="case-archived"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('case-archived', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography>
                  <strong>(User Info)</strong>
                </Typography>
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>

            {admins.includes(role) && (
              <>
                <TableRow className={classes.row}>
                  <TableCell>
                    <Typography className={classes.label}>
                      Notify me when a new user is created
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.settingOption('user-added-to-company', 'app')}
                          onChange={handleChange}
                          name="user-added-to-company"
                          value="app"
                          color="primary"
                          size="small"
                        />
                      }
                      label={onOrOff(data.settingOption('user-added-to-company', 'app'))}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.settingOption('user-added-to-company', 'email')}
                          onChange={handleChange}
                          name="user-added-to-company"
                          value="email"
                          color="primary"
                          size="small"
                        />
                      }
                      label={onOrOff(data.settingOption('user-added-to-company', 'email'))}
                    />
                  </TableCell>
                </TableRow>

                <TableRow className={classes.row}>
                  <TableCell>
                    <Typography className={classes.label}>
                      Notify me when a user has been deleted
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.settingOption('user-removed-from-company', 'app')}
                          onChange={handleChange}
                          name="user-removed-from-company"
                          value="app"
                          color="primary"
                          size="small"
                        />
                      }
                      label={onOrOff(data.settingOption('user-removed-from-company', 'app'))}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.settingOption('user-removed-from-company', 'email')}
                          onChange={handleChange}
                          name="user-removed-from-company"
                          value="email"
                          color="primary"
                          size="small"
                        />
                      }
                      label={onOrOff(data.settingOption('user-removed-from-company', 'email'))}
                    />
                  </TableCell>
                </TableRow>

                <TableRow className={classes.row}>
                  <TableCell>
                    <Typography className={classes.label}>
                      Notify me when a new user accepts an invitation
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.settingOption('user-verified-account', 'app')}
                          onChange={handleChange}
                          name="user-verified-account"
                          value="app"
                          color="primary"
                          size="small"
                        />
                      }
                      label={onOrOff(data.settingOption('user-verified-account', 'app'))}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.settingOption('user-verified-account', 'email')}
                          onChange={handleChange}
                          name="user-verified-account"
                          value="email"
                          color="primary"
                          size="small"
                        />
                      }
                      label={onOrOff(data.settingOption('user-verified-account', 'email'))}
                    />
                  </TableCell>
                </TableRow>
              </>
            )}

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when a user has been added to one or more of my cases
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('user-added-to-case', 'app')}
                      onChange={handleChange}
                      name="user-added-to-case"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('user-added-to-case', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('user-added-to-case', 'email')}
                      onChange={handleChange}
                      name="user-added-to-case"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('user-added-to-case', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <Typography>
                  <strong>(Shared Info)</strong>
                </Typography>
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>

            {/** Shared Info */}
            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when a share link is created
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-created', 'app')}
                      onChange={handleChange}
                      name="share-link-created"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-created', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-created', 'email')}
                      onChange={handleChange}
                      name="share-link-created"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-created', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when a share link is clicked
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-clicked', 'app')}
                      onChange={handleChange}
                      name="share-link-clicked"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-clicked', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-clicked', 'email')}
                      onChange={handleChange}
                      name="share-link-clicked"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-clicked', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when files are uploaded using a share link
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-files-uploaded', 'app')}
                      onChange={handleChange}
                      name="share-link-files-uploaded"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-files-uploaded', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-files-uploaded', 'email')}
                      onChange={handleChange}
                      name="share-link-files-uploaded"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-files-uploaded', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when files are downloaded using a share link
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-files-downloaded', 'app')}
                      onChange={handleChange}
                      name="share-link-files-downloaded"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-files-downloaded', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('share-link-files-downloaded', 'email')}
                      onChange={handleChange}
                      name="share-link-files-downloaded"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('share-link-files-downloaded', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <Typography>
                  <strong>(Workspace Info)</strong>
                </Typography>
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when an Employee or Client user uploads files to my case Workgroup
                  folders
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('files-uploaded', 'app')}
                      onChange={handleChange}
                      name="files-uploaded"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('files-uploaded', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('files-uploaded', 'email')}
                      onChange={handleChange}
                      name="files-uploaded"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('files-uploaded', 'email'))}
                />
              </TableCell>
            </TableRow>

            <TableRow className={classes.row}>
              <TableCell>
                <Typography className={classes.label}>
                  Notify me when an Employee or Client user downloads files from my case Workgroup
                  folders
                </Typography>
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('files-downloaded', 'app')}
                      onChange={handleChange}
                      name="files-downloaded"
                      value="app"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('files-downloaded', 'app'))}
                />
              </TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.settingOption('files-downloaded', 'email')}
                      onChange={handleChange}
                      name="files-downloaded"
                      value="email"
                      color="primary"
                      size="small"
                    />
                  }
                  label={onOrOff(data.settingOption('files-downloaded', 'email'))}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
