import { useEffect, useContext } from 'react'

/** Data */
import useStatus from 'Lib/useStatus'
import ManageUsersProvider from './ManageUsersProvider'
import { ManageUsersContext } from './ManageUsersProvider'

/** Material UI */
import { primary } from 'App/theme'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import SettingsIcon from '@material-ui/icons/Settings'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { NoRowsTableView } from 'Workspace/WorkspaceTable/NoRowsTableView'
import { XGrid, LicenseInfo, GridColDef, GridRowData } from '@material-ui/x-grid'

/** UI Components */
import { Template } from 'UI'
import { UserFilterItems } from '../../Account/UserFilterItems'
import EmployeeButton from './Employee/EmployeeButton'
import ClientButton from './Client/ClientButton'
import InviteClientModal from './Client/InviteClientModal'
import InviteEmployeeModal from './Employee/InviteEmployeeModal'
import EditClientModal from './Client/EditClientModal'
import EditEmployeeModal from './Employee/EditEmployeeModal'

/** Helpers */
import {
  useTheming,
  useMobileJustify,
  formatLoginDate,
  isClientUser,
  isEmployee,
  inverseFormatRoleName,
  formatRoleName,
} from 'Lib'

const useStyles = makeStyles((theme) => ({
  paper: {
    'minHeight': '70vh',
    'width': '100%',
    'boxShadow': 'none',
    'overflow': 'auto',
    'borderRadius': '25px',
    '&::-webkit-scrollbar-track': {
      borderRadius: '10px',
      backgroundColor: '#dbefda',
    },
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px',
      backgroundColor: '#F5F5F5',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '10px',
      backgroundColor: '#5FB158',
    },
  },
  th: {
    color: `${primary}`,
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  employees: {
    color: '#0070C0',
  },
  hr: {
    color: `${primary}`,
    height: '1px',
  },
  dataGrid: {
    'height': '625px',
    'width': '100%',
    'overflowY': 'scroll',
    'position': 'relative',
    '& .MuiDataGrid-columnsContainer': {
      borderBottom: '2px solid #5FB158',
      minHeight: '35px !important',
      maxHeight: '35px !important',
    },
    '& .MuiDataGrid-window': {
      'top': '35px !important',
      '&::-webkit-scrollbar-track': {
        borderRadius: '10px',
        backgroundColor: '#dbefda',
      },
    },
  },
  buttonBox: {
    'margin': '4rem 0 0 0',
    '& > :last-child': {
      margin: '1rem 0 0 0',
    },
  },
}))

export function ManageUsers() {
  return (
    <ManageUsersProvider>
      <ManageUsersPage />
    </ManageUsersProvider>
  )
}

export function ManageUsersPage() {
  const theming = useTheming()
  const justify = useMobileJustify()
  const classes = useStyles()
  const { manageUsers: data } = useContext(ManageUsersContext)
  useStatus({ success: data.successMessage, error: data.errorMessage })

  useEffect(() => {
    data.loadUsers().then(() => {})
  }, [])

  const handleChangeSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const terms = ev.target.value
    data.searchTerms = terms

    if (terms === '') {
      data.resetSearch()
    } else {
      data.search()
    }
  }

  const handleClearSearch = () => {
    data.resetSearch()
  }

  LicenseInfo.setLicenseKey(process.env.REACT_APP_XGRID_KEY ?? '')

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      type: 'string',
      flex: 2,
    },
    {
      field: 'role',
      headerName: 'Role',
      type: 'string',
      flex: 1,
    },
    {
      field: 'company',
      headerName: 'Company',
      type: 'string',
      flex: 1,
    },
    {
      field: 'last_login',
      headerName: 'Last Login',
      type: 'string',
      flex: 1,
    },
    {
      field: 'manage',
      headerName: 'Manage',
      width: 110,
      renderCell: (params) => {
        const onClick = (ev: React.MouseEvent) => {
          ev.stopPropagation()

          const userId = Number(params.id ?? 0)
          const role = inverseFormatRoleName(params.row['role'])
          data.userId = userId

          if (isEmployee(role)) {
            data.employeeEditModalOpen = true
          } else if (isClientUser(role)) {
            data.clientEditModalOpen = true
          }
        }

        return (
          <div onClick={onClick}>
            <SettingsIcon />
          </div>
        )
      },
    },
  ]

  const rows: GridRowData[] = data.users.map((user) => {
    return {
      id: user.id,
      name: `${user.last_name}, ${user.first_name}`,
      email: user.email,
      role: formatRoleName(user.role),
      company: user.company_name,
      last_login: formatLoginDate(user.last_login),
    }
  })

  return (
    <Template
      title="Manage Users"
      isLoading={data.isLoading}
      FilterItems={UserFilterItems}
      isError={data.isError}
      errorMessage="There was an error fetching the users. Please try again soon"
      onSimpleSearchChange={handleChangeSearch}
      onSimpleClearSearch={handleClearSearch}
    >
      <Paper className={classes.paper}>
        <Grid container justify={justify} alignContent="flex-start" className={theming.row}>
          <Grid container item xs={3} spacing={3} justify="center">
            <Box display="flex" flexDirection="column" className={classes.buttonBox}>
              <EmployeeButton />
              <ClientButton />
            </Box>
          </Grid>

          <Grid container item xs={9}>
            {data.users && (
              <>
                <Grid container item xs={12} justify="space-between">
                  <Grid item>
                    <Typography>
                      <strong>User Address Book</strong>
                    </Typography>
                  </Grid>

                  <Grid item>
                    <Typography className={classes.employees}>
                      <strong>
                        Current Employees: {data.employeeInfo.current} of {data.employeeInfo.max}
                      </strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <hr className={classes.hr} />
                  </Grid>
                </Grid>
                <Grid container item xs={12} className={classes.dataGrid}>
                  <XGrid
                    columns={columns}
                    rows={rows}
                    disableSelectionOnClick
                    pageSize={10}
                    rowsPerPageOptions={[5, 10]}
                    pagination
                    components={{
                      NoRowsOverlay: NoRowsTableView,
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
      <InviteEmployeeModal />
      <InviteClientModal />
      <EditEmployeeModal />
      <EditClientModal />
    </Template>
  )
}
