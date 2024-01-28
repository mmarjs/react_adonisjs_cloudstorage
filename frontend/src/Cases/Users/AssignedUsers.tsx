import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'

/** Data */
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import useObserver from 'pojo-observer'
import AssignedUsersContainer from './AssignedUsersContainer'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import useStatus from 'Lib/useStatus'
import Typography from '@material-ui/core/Typography'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { NoRowsTableView } from 'Workspace/WorkspaceTable/NoRowsTableView'
import { XGrid, LicenseInfo, GridColDef, GridRowData } from '@material-ui/x-grid'

/** UI */
import { Template, IconTitle } from 'UI'
import { CaseMenu } from '../CaseMenu'
import { CaseFilterItems } from '../CaseFilterItems'
import { ReactComponent as TrashIcon } from 'Image/icon_trash_delete.svg'

/** Helpers */

import clsx from 'clsx'
import toInteger from 'lodash-es/toInteger'
import { useAxios, MANAGE_CASES_URL, ASSIGNED_USERS, formatLoginDate, formatRoleName } from 'Lib'
import { BreadCrumbLink, CasePermissionParams, AvailableUserCaseOption } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '80vh',
  },
  assignedUserTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#4472C4',
    textAlign: 'center',
    marginBottom: 10,
  },
  assignedUserWrap: {
    padding: '50px 20px 20px 20px !important',
    width: '100%',
    backgroundColor: '#ffffff',
    minHeight: '600px',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    borderRadius: '25px',
    overflowY: 'scroll',
  },
  cellTrashIconActive: {
    width: 20,
    fill: '#4472C4',
    cursor: 'pointer',
  },
  cellTrashIconInActive: {
    display: 'none',
  },
  searchOption: {
    'borderTop': '1px solid #5FB158',
    'paddingTop': '20px',
    'marginBottom': 20,
    'position': 'relative',
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      border: 0,
    },
    '& .MuiInput-underline:before': {
      border: 0,
    },
    '& .MuiInput-underline:after': {
      border: 0,
    },
    '& .MuiSelect-select': {
      border: '1px solid #5FB158',
      height: '28px',
      fontSize: '14px',
      color: '#636161',
      padding: '0 24px 0 10px',
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#5FB158',
    },
  },
  userAddButton: {
    width: 60,
    marginLeft: 10,
  },
  caseIcon: {
    fontSize: '1.5rem',
  },
  dataGrid: {
    'height': '400px',
    'width': '100%',
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
}))

interface ParamTypes {
  case_id: string
}

export function AssignedUsers() {
  const { case_id } = useParams<ParamTypes>()
  const caseId = toInteger(case_id)
  const axios = useAxios()
  const classes = useStyles()
  const container = useRef<AssignedUsersContainer>(new AssignedUsersContainer(caseId, axios))
  const data = useObserver(container.current)
  const [caseName, setCaseName] = useState('Case Name')
  const [currentOption, setCurrentOption] = useState<AvailableUserCaseOption>({ title: '', id: 0 })

  useEffect(() => {
    data.loadCurrentCase().then(() => {
      setCaseName(data.case?.case_name ?? 'Case Name')
    })
    data.loadAssignedUsers().then(() => {})
  }, [])

  useStatus({ success: data.successMessage, error: data.errorMessage })

  const companyId = useSelector((state: AppState) => state.company.id)

  const handleChangeUser = (ev: React.ChangeEvent<{}>, value: AvailableUserCaseOption | null) => {
    setCurrentOption({
      title: value?.title ?? '',
      id: value?.id ?? 0,
    })
  }

  const handleAddUser = () => {
    let params: CasePermissionParams = {
      userId: currentOption.id,
      companyId: companyId,
      resourceId: caseId,
    }
    data.addUser(params).then(() => {})
    setCurrentOption({ title: '', id: 0 })
  }

  const handleRemoveUser = (userId: number) => {
    let params: CasePermissionParams = {
      userId: userId,
      companyId: companyId,
      resourceId: caseId,
    }
    data.removeUser(params).then(() => {})
  }

  const breadcrumbs: BreadCrumbLink[] = [
    {
      name: 'Manage Cases',
      href: MANAGE_CASES_URL,
    },
    {
      name: 'Assigned Users',
      href: ASSIGNED_USERS,
    },
  ]

  const Title = () => (
    <IconTitle
      Icon={() => <BusinessCenterIcon className={classes.caseIcon} />}
      text={caseName ?? ''}
    />
  )

  LicenseInfo.setLicenseKey(process.env.REACT_APP_XGRID_KEY ?? '')

  const columns: GridColDef[] = [
    {
      field: 'first_name',
      headerName: 'First',
      type: 'string',
      flex: 1,
    },
    {
      field: 'last_name',
      headerName: 'Last',
      type: 'string',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      type: 'string',
      flex: 1,
    },
    {
      field: 'role',
      headerName: 'Role',
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
      field: 'trash',
      headerName: 'Remove',
      width: 100,
      renderCell: (params) => {
        return (
          <TrashIcon
            className={clsx({
              [classes.cellTrashIconActive]: ['Case Manager', 'Client User'].includes(
                params.row['role']
              ),
              [classes.cellTrashIconInActive]: !['Case Manager', 'Client User'].includes(
                params.row['role']
              ),
            })}
            onClick={() => handleRemoveUser(params.row['id'])}
          />
        )
      },
    },
  ]

  const rows: GridRowData[] = data.users.map((user) => {
    return {
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: formatRoleName(user.role),
      last_login: formatLoginDate(user.last_login),
    }
  })

  return (
    <Template
      title={caseName ?? ''}
      TitleComponent={Title}
      isLoading={data.isLoading}
      breadcrumbs={breadcrumbs}
      isError={data.isError}
      errorMessage={data.errorMessage}
      FilterItems={CaseFilterItems}
      MenuItems={CaseMenu}
    >
      <Grid container justify="center" alignItems="center" spacing={2} className={classes.root}>
        <Grid item className={classes.assignedUserWrap}>
          <Typography className={classes.assignedUserTitle}>Assigned Users</Typography>

          <Grid container className={classes.searchOption}>
            <Autocomplete
              id="available-users"
              autoHighlight
              options={data.makeAvailableOptions()}
              getOptionLabel={(option) => option.title}
              style={{ width: 600 }}
              value={currentOption}
              onChange={handleChangeUser}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Search by name/email"
                  variant="outlined"
                />
              )}
            />
            <Button
              variant="contained"
              fullWidth
              color="primary"
              type="submit"
              disabled={currentOption.id === 0}
              onClick={handleAddUser}
              className={classes.userAddButton}
            >
              Add
            </Button>
          </Grid>

          <Grid container item xs={12} className={classes.dataGrid}>
            <XGrid
              columns={columns}
              rows={rows}
              disableSelectionOnClick
              pageSize={5}
              rowsPerPageOptions={[5]}
              pagination
              components={{
                NoRowsOverlay: NoRowsTableView,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Template>
  )
}
