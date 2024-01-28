/** Data */
import EditUserContainer from './Containers/EditUserContainer'
import InviteUserContainer from './Containers/InviteUserContainter'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import { XGrid, LicenseInfo, GridColDef, GridRowData, GridRowId } from '@material-ui/x-grid'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** Helpers */
import { clamp } from 'Lib'

interface Props {
  data: InviteUserContainer | EditUserContainer
}

const useStyles = makeStyles((theme) => ({
  root: {
    'minHeight': '400px',
    'maxHeight': '500px',
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
}))

export default function EditEmployeePermissions(props: Props) {
  const classes = useStyles()
  const { data } = props

  LicenseInfo.setLicenseKey(process.env.REACT_APP_XGRID_KEY ?? '')

  const columns: GridColDef[] = [
    {
      field: 'case',
      headerName: 'Case',
      type: 'string',
      flex: 1,
    },
    {
      field: 'clientName',
      headerName: 'Client Name',
      type: 'string',
      flex: 1,
    },
    {
      field: 'matterNo',
      headerName: 'Client Matter No',
      type: 'string',
      flex: 1,
    },
  ]

  const rows: GridRowData[] = []

  for (const item of data.cases) {
    const row: GridRowData = {
      id: item.id,
      case: clamp(item.case_name, 50),
      clientName: item.client_name,
      matterNo: item.client_reference,
    }

    rows.push(row)
  }

  return (
    <>
      <Grid container justify="center" className={classes.root}>
        <Grid item xs={12}>
          <XGrid
            columns={columns}
            rows={rows}
            pageSize={5}
            pagination
            checkboxSelection
            selectionModel={data.permittedCases as GridRowId[]}
            onSelectionModelChange={(ids) => {
              data.permittedCases = ids.selectionModel as number[]
            }}
          />
        </Grid>
      </Grid>
    </>
  )
}
