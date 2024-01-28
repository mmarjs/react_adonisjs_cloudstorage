import { useDispatch } from 'react-redux'
import { XGrid, LicenseInfo } from '@material-ui/x-grid'
import { CaseTableViewProps } from 'types'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useHistory } from 'react-router-dom'
import { setFieldNodeId } from 'Data/TableViewDataList'
import { setCaseId, setSelectedCaseData, setCollapseOption } from 'Data/Workspace'
import { WORKSPACE_URL } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    'width': '100%',
    'height': 'calc(100vh - 280px)',
    '& .MuiDataGrid-columnsContainer': {
      minHeight: '40px !important',
      maxHeight: '40px !important',
      borderBottom: '2px solid #5FB158',
      background: '#ffffff',
    },
    '& .MuiDataGrid-footer': {
      background: '#ffffff',
    },
    '& .MuiDataGrid-window': {
      'top': '40px !important',
      'borderBottom': 0,
      'background': '#ffffff',
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
  },
}))

export function CaseTableView(props: CaseTableViewProps) {
  let key: string | undefined = process.env.REACT_APP_XGRID_KEY
  LicenseInfo.setLicenseKey(key ? key : '')
  const { dataColumns, rowData } = props
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  const onSelectFolder = (caseData) => {
    let optionList: any = {
      workgroup: true,
      personal: false,
      share: false,
    }
    dispatch(setFieldNodeId(0))
    dispatch(setCollapseOption(optionList))
    dispatch(setCaseId(caseData?.id))
    dispatch(setSelectedCaseData(caseData))
    history.push(WORKSPACE_URL)
  }

  return (
    <div className={classes.root}>
      <XGrid
        rows={rowData}
        columns={dataColumns}
        rowHeight={38}
        disableSelectionOnClick={true}
        onRowDoubleClick={(newSelection) => {
          onSelectFolder(newSelection.row)
        }}
      />
    </div>
  )
}
