import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { XGrid, LicenseInfo } from '@material-ui/x-grid'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Box from '@material-ui/core/Box'
import IconFolder from '../../../Image/icon_folder.svg'
import IconFile from '../../../Image/icon-file.svg'
import { ReactComponent as ToolbarDownloadIcon } from 'Image/download.svg'
import Alert from '@material-ui/lab/Alert'
import { useIsMounted, useFileDownload } from 'Lib'
import { AppState } from 'App/reducers'
import useValidUntil from '../useValidUntil'
import { RenderIconCell } from '../../TableFileIcon'
import { WorkspaceCollapseOption } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    'width': '70vw',
    'height': '70vh',
    '& .MuiDataGrid-columnsContainer': {
      minHeight: '35px !important',
      maxHeight: '35px !important',
      borderBottom: '2px solid #5FB158',
      borderTop: '2px solid #5FB158',
      background: '#ffffff',
    },
    '& .MuiDataGrid-footer': {
      display: 'none',
    },
    '& .icon-menu-header': {
      'padding': '0 7px',
      'cursor': 'unset',
      'outline': '0',
      '& .MuiDataGrid-menuIcon': {
        display: 'none',
      },
      '& .MuiDataGrid-sortIcon': {
        display: 'none',
      },
    },
    '& .icon-menu-cell': {
      padding: '0 7px',
    },
    '& .icon-download-cell:focus-within': {
      outline: '0px',
    },
    '& .MuiDataGrid-window': {
      'top': '35px !important',
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
  paper: {
    width: '100%',
    height: '100%',
    padding: '1rem',
    borderRadius: '25px',
  },
  folder: {
    width: '30px',
    height: '30px',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url(${IconFolder})`,
  },
  file: {
    width: '30px',
    height: '30px',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url(${IconFile})`,
  },
  toolbarDownload: {
    cursor: 'pointer',
    width: '25px',
    fill: '#4472C4',
  },
  toolbar: {
    padding: '10px',
  },
  arrowIcon: {
    cursor: 'pointer',
    width: '20px',
  },
  arrowIconGroup: {
    marginTop: '15px',
  },
  cellDownloadIcon: {
    width: '20px',
    height: '20px',
    fill: '#4472C4',
    cursor: 'pointer',
  },
  alertRow: {
    position: 'absolute',
    marginTop: '-1rem',
  },
  messageTitle: {
    width: '50%',
  },
}))

export function ShareDownload() {
  const { setSafely } = useIsMounted()
  let key: string | undefined = process.env.REACT_APP_XGRID_KEY
  LicenseInfo.setLicenseKey(key ? key : '')
  const classes = useStyles()
  const [selectionModelIds, setSelectionModelIds] = useState<number[]>([])
  const [exportData, setExportData] = useState<any>([])
  const [isError, setError] = useState(false)
  const [errorMessage] = useState<string>('')
  const sharedFileData = useSelector((state: AppState) => state.share.sharedFileData)
  const shareLinkId = useSelector((state: AppState) => state.share.shareLink.id)

  const collapseOption: WorkspaceCollapseOption = {
    workgroup: false,
    personal: false,
    share: true,
    recycle: false,
  }
  const { onFileDownload } = useFileDownload(collapseOption)
  const validUntil = useValidUntil()

  const dataColumns = [
    {
      field: 'icon',
      headerName: 'Icon',
      width: 50,
      resizable: false,
      renderCell: RenderIconCell,
      cellClassName: 'icon-menu-cell',
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      type: 'string',
    },
    {
      field: 'modifiedDate',
      headerName: 'Modified Date-time',
      width: 200,
      type: 'string',
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 100,
      type: 'string',
    },
  ]

  const downloadData = () => {
    var data: object[] = []

    for (let item of exportData) {
      let next = { ...item, data_id: item.id }

      data.push(next)
    }

    onFileDownload(data, shareLinkId)
  }

  const setExportDataByChecked = (selectData: any) => {
    const currentIndex = selectionModelIds.indexOf(parseInt(selectData.id))
    const newChecked = [...exportData]
    if (currentIndex === -1) {
      newChecked.push(selectData)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    let selectionIds: number[] = []
    newChecked.map((checkRow, index) => {
      selectionIds.push(parseInt(checkRow.id))
      return checkRow
    })
    setSafely(setExportData, newChecked)
    setSafely(setSelectionModelIds, selectionIds)
  }

  return (
    <>
      <Grid container justify="center" alignItems="center">
        <Grid xs={12} item className={classes.root}>
          <Grid container justify="center" direction="column">
            <Typography variant="h1" align="center">
              <strong>Secure Download Access</strong>
            </Typography>
            <Box my={2}>
              <Typography align="center" color="primary">
                VALID TILL: {validUntil.toUpperCase()}
              </Typography>
            </Box>
          </Grid>
          {isError && (
            <Grid container justify="center" className={classes.alertRow}>
              <Grid container item justify="center">
                <Alert
                  severity="error"
                  className={classes.messageTitle}
                  onClose={() => setSafely(setError, false)}
                >
                  {errorMessage}
                </Alert>
              </Grid>
            </Grid>
          )}
          <Grid item style={{ height: 'calc(100% - 60px)' }}>
            <Grid container justify={'flex-end'} alignItems={'center'} className={classes.toolbar}>
              <ToolbarDownloadIcon className={classes.toolbarDownload} onClick={downloadData} />
            </Grid>
            <XGrid
              rows={sharedFileData[0]?.id !== undefined ? sharedFileData : []}
              columns={dataColumns}
              rowHeight={30}
              checkboxSelection
              disableSelectionOnClick={true}
              onRowSelected={(newSelection) => {
                setExportDataByChecked(newSelection.data)
              }}
              onSelectionModelChange={(newSelection) => {
                if (sharedFileData.length === newSelection.selectionModel.length) {
                  let selectionIds: number[] = []
                  sharedFileData.map((checkRow: any, index: number) => {
                    selectionIds.push(parseInt(checkRow.id))
                    return checkRow
                  })
                  setExportData(sharedFileData)
                  setSelectionModelIds(selectionIds)
                } else if (newSelection.selectionModel.length === 0) {
                  setExportData([])
                  setSelectionModelIds([])
                }
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
