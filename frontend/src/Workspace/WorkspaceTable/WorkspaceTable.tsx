import React, { useState, useEffect, useContext } from 'react'
import { XGrid, LicenseInfo } from '@material-ui/x-grid'
import Grid from '@material-ui/core/Grid'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import arrayMove from 'array-move'
import {
  setFilterFlag,
  setSelectRowDetail,
  setSelectedFolderFileIds,
  setSelectedFolders,
} from 'Data/TableViewDataList'
import {
  setIsContextMenu,
  setCurrentFileName,
  setCurrentFileIdByContext,
  setContextFileType,
  setShareFormOpen,
  setShareUpdateData,
} from 'Data/Workspace'
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox'
import { FieldCells } from '../DumyData'
import { useKeypress, useIsMounted } from 'Lib'
import Tooltip from '@material-ui/core/Tooltip'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import ReactHoverObserver from 'react-hover-observer'
import clsx from 'clsx'
import { ShareForm } from '../Share/Login/ShareForm'
import { useWorkspaceData } from '../useWorkspaceData'
import { WorkspaceGridContext, Store } from 'Workspace'
import { UploadCategory } from 'types'
import { getFileIconPath } from '../common'
import { NoRowsIconView } from './NoRowsIconView'
import { NoRowsTableView } from './NoRowsTableView'
import { FooterStatus } from './FooterStatus'

const useStyles = makeStyles((theme) => ({
  root: {
    'flexGrow': 1,
    'height': 'calc(100% - 30px)',
    'width': '100%',
    'position': 'relative',
    '& .MuiDataGrid-columnsContainer': {
      borderBottom: '2px solid #5FB158',
      minHeight: '35px !important',
      maxHeight: '35px !important',
    },
    '& .MuiDataGrid-cell': {
      'borderBottom': '0px',
      'paddingLeft': '5px',
      '&:focus-within': {
        outline: 'solid #5FB158 0px',
      },
    },
    '& .table-size-cell': {
      textAlign: 'right',
    },
    '& .MuiDataGrid-cellCheckbox': {
      paddingLeft: '0',
    },
    '& .MuiDataGrid-row': {
      '&:focus-within': {
        background: '#ade2ad',
      },
    },
    '& .MuiDataGrid-window': {
      'top': '35px !important',
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
      'label': {
        marginTop: theme.spacing(1),
      },
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
  },
  largeRoot: {
    'overflowY': 'auto',
    'flexGrow': 1,
    'height': 'calc(100% - 30px)',
    'width': '100%',
    'position': 'relative',
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
    '& .MuiDataGrid-columnsContainer': {
      borderBottom: '2px solid #5FB158',
      borderTop: '2px solid #5FB158',
    },
    '& .MuiDataGrid-cell': {
      'borderBottom': '0px',
      'paddingLeft': '5px',
      '&:focus-within': {
        outline: 'solid #5FB158 0px',
      },
    },
    '& .MuiDataGrid-cellCheckbox': {
      paddingLeft: '0',
    },
    '& .MuiDataGrid-row': {
      '&:focus-within': {
        background: '#ade2ad',
      },
    },
    '& .MuiDataGrid-renderingZone': {
      display: 'none',
    },
    '& .MuiDataGrid-window': {
      'overflowY': 'hidden !important',
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
  large: {
    width: '100%',
    padding: '20px',
  },
  noRowlarge: {
    width: '100%',
    padding: '20px',
    justifyContent: 'center',
  },
  smallIcon: {
    width: '40px',
    height: '40px',
  },
  mediumIcon: {
    width: '150px',
    padding: '15px 10px 0 10px',
  },
  fileMediumIcon: {
    width: '150px',
    padding: '15px 10px 0 10px',
  },
  largeIconItem: {
    'display': 'flex',
    'flexDirection': 'column',
    'alignItems': 'center',
    'margin': '20px',
    'position': 'relative',
    'paddingBottom': '10px',
    '&:hover': {
      'background': '#F1EFF1',
      '& > .MuiCheckbox-root': {
        display: 'block',
      },
    },
    // 'pointerEvents': 'none',
  },
  largeIconItemActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px',
    position: 'relative',
    paddingBottom: '10px',
    background: '#F1EFF1',
  },
  largeIconItemDisable: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px',
    position: 'relative',
    paddingBottom: '10px',
    background: '#F1EFF1',
    pointerEvents: 'none',
  },
  largeIcon: {
    width: '200px',
    padding: '15px 10px 0 10px',
  },
  fileLargeIcon: {
    width: '200px',
    padding: '15px 10px 0 10px',
  },
  mediumIconCheckBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
  },
  mediumIconCheckBoxActive: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  largeIconCheckBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
  },
  largeIconCheckBoxActive: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  largeContainer: {
    'height': '100%',
    'overflowY': 'auto',
    'overflowX': 'hidden',
    '&::-webkit-scrollbar-track': {
      borderRadius: '10px',
      backgroundColor: '#dbefda',
    },
    '&::-webkit-scrollbar': {
      width: '7px',
      backgroundColor: '#F5F5F5',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '10px',
      backgroundColor: '#5FB158',
    },
  },
  largeNoRowContainer: {
    'height': '100%',
    'overflowY': 'auto',
    'overflowX': 'hidden',
    'display': 'flex',
    'flexDirection': 'column',
    'justifyContent': 'center',
    '&::-webkit-scrollbar-track': {
      borderRadius: '10px',
      backgroundColor: '#dbefda',
    },
    '&::-webkit-scrollbar': {
      width: '7px',
      backgroundColor: '#F5F5F5',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '10px',
      backgroundColor: '#5FB158',
    },
  },
  mediumViewName: {
    display: 'flex',
    alignItems: 'center',
    bottom: '5px',
    right: '40px',
  },
  largeViewName: {
    display: 'flex',
    alignItems: 'center',
    right: '70px',
    bottom: '5px',
  },
  titleellipsis: {
    color: 'rgba(0, 0, 0, 0.87)',
  },
  hoverObserver: {
    'display': 'flex',
    'width': '100%',
    '& .MuiDataGrid-root': {
      border: 0,
    },
  },
  arrowIconGroup: {
    marginTop: '15px',
    padding: '0 6px',
  },
  disableArrowIcon: {
    cursor: 'pointer',
    width: '20px',
    color: '#8d8d8d',
    pointerEvents: 'none',
  },
  activeArrowIcon: {
    cursor: 'pointer',
    width: '20px',
  },
}))

const GreenCheckbox = withStyles({
  root: {
    'color': '#5FB158',
    '&$checked': {
      color: '#5FB158',
    },
  },
  checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />)

interface WorkspaceTableProps {
  onSetItem: (columnsData: any, exportData: any) => void
}

export function WorkspaceTable(props: WorkspaceTableProps) {
  let key: string | undefined = process.env.REACT_APP_XGRID_KEY
  LicenseInfo.setLicenseKey(key ? key : '')
  const { onSetItem } = props
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const dispatch = useDispatch()
  const {
    goToWorkgroupLocation,
    getParentFolders,
    onGetSimpleSearch,
    onGetAdvancedSearch,
    clearPagination,
  } = useWorkspaceData()
  const [rowData, setRowData] = useState<any[]>([])
  const [exportData, setExportData] = useState<any[]>([])
  const [selectionModelIds, setSelectionModelId] = useState<number[]>([])
  const [selectionModelContextId, setSelectionModelContextId] = useState<number | null>()
  // const [viewContains, setViewCotains] = useState<any>([])
  const [groupType, setGroupType] = useState<string>('')
  const fieldList = useSelector((state: AppState) => state.tableViewData.fieldList)
  const collapseOption = useSelector((state: AppState) => state.workspaceData.collapseOption)
  const detailList = useSelector((state: AppState) => state.tableViewData.selectRowDetail)
  const filterFlag = useSelector((state: AppState) => state.tableViewData.filterFlag)
  const viewMode = useSelector((state: AppState) => state.workspaceData.mode)
  const selectedFolders = useSelector((state: AppState) => state.tableViewData.selectedFolders)
  const pending = useSelector((state: AppState) => state.workspaceData.pendingNotification)
  const shareFormOpen = useSelector((state: AppState) => state.workspaceData.shareFormOpen)
  let mode: string[] = ['medium', 'large']
  let rowDataList: any[] = []
  let dataColumns: any[] = []
  let iconData: any[] = []
  const shareLinkdata = useSelector((state: AppState) => state.workspaceData.shareLinkData)
  const isLoader = useSelector((state: AppState) => state.workspaceData.isLoader)
  const currentParentId = useSelector((state: AppState) => state.tableViewData.fieldNodeId)
  const workgroupParentId = useSelector((state: AppState) => state.workspaceData.workgroupParentId)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const personalParentId = useSelector((state: AppState) => state.workspaceData.personalParentId)
  const userId = useSelector((state: AppState) => state.user.id)

  const {
    workgroupData,
    personalData,
    workspaceTableData,
    folderPath,
    searchMode,
    searchTableData,
    searchText,
    searchAdvancedFilterData,
    workspaceRecycleBinTableData,
    pagination,
    setPagination,
    setWorkspaceTableData,
    setSearchTableData,
  } = useContext(WorkspaceGridContext) as Store

  if (folderPath.charAt(0) === 's') {
    rowDataList = shareLinkdata
  } else {
    if (searchMode) {
      rowDataList = searchTableData
    } else {
      rowDataList = folderPath.charAt(0) === 'r' ? workspaceRecycleBinTableData : workspaceTableData
    }
  }

  if (filterFlag) {
    iconData = rowData
  } else {
    iconData = rowDataList
  }

  let restDataColumns: any[] = []
  const [columnsData, setColumnData] = useState<any[]>([])

  useEffect(() => {
    setRowData([])
    setExportData([])
  }, [currentParentId, collapseOption])

  useEffect(() => {
    if (selectedFolders.length === 0) {
      setSelectionModelId([])
    }
  }, [selectedFolders])

  React.useMemo(() => {
    let fieldListData: any = []
    if (searchMode) {
      fieldListData = FieldCells.find((item) => item.type === 'search')
    } else if (folderPath.charAt(0) === 'w') {
      fieldListData = FieldCells.find((item) => item.type === 'workgroup')
    } else if (folderPath.charAt(0) === 'p') {
      fieldListData = FieldCells.find((item) => item.type === 'personal')
    } else if (folderPath.charAt(0) === 'r') {
      fieldListData = FieldCells.find((item) => item.type === 'recycle')
    } else if (folderPath.charAt(0) === 's') {
      fieldListData = FieldCells.find((item) => item.type === 'share')
      setColumnData(fieldListData.fieldList)
    }
    setColumnData(fieldListData.fieldList)
  }, [searchMode, collapseOption, setColumnData, folderPath, groupType])

  columnsData?.map((fieldData: any) => {
    if (fieldList.indexOf(fieldData.field) === -1) {
      dataColumns.push(fieldData)
    } else {
      restDataColumns.push(fieldData)
    }
    return fieldData
  })

  useKeypress('ArrowDown', () => {
    let detailIndex: number = iconData.indexOf(detailList)
    if (detailIndex < iconData.length - 1) {
      dispatch(setSelectRowDetail(iconData[detailIndex + 1]))
    }
  })

  useKeypress('ArrowUp', () => {
    let detailIndex: number = iconData.indexOf(detailList)
    dispatch(setSelectRowDetail(iconData[detailIndex - 1]))
  })

  const setReorderColumns = (oldIndex: number, newIndex: number) => {
    dataColumns = arrayMove(dataColumns, oldIndex - 1, newIndex - 1)
    let fieldListData = restDataColumns.concat(dataColumns)
    setColumnData(fieldListData)
    onSetItem(fieldListData, exportData)
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
    setExportData(newChecked)
    setSelectionModelId(selectionIds)
    dispatch(setSelectedFolderFileIds(selectionIds))
    dispatch(setSelectedFolders(newChecked))
    onSetItem(columnsData, newChecked)
  }

  const sortDataRow = (sortField: any) => {
    dispatch(setFilterFlag(true))
    let exportDataList = exportData
    if (sortField) {
      iconData.sort((a: any, b: any) => {
        if (sortField.sort === 'desc') {
          if (a[sortField.field] > b[sortField.field]) return -1
          if (a[sortField.field] < b[sortField.field]) return 1
          return 0
        } else {
          if (b[sortField.field] > a[sortField.field]) return -1
          if (b[sortField.field] < a[sortField.field]) return 1
          return 0
        }
      })
      exportDataList = exportDataList.slice().sort((a: any, b: any) => {
        if (sortField.sort === 'desc') {
          if (a[sortField.field] > b[sortField.field]) return -1
          if (a[sortField.field] < b[sortField.field]) return 1
          return 0
        } else {
          if (b[sortField.field] > a[sortField.field]) return -1
          if (b[sortField.field] < a[sortField.field]) return 1
          return 0
        }
      })
    }
    setExportData(exportDataList)
    setRowData(iconData)
  }

  const onSelectFolder = (rowData: any) => {
    if (rowData.type !== 'folder') return
    clearPagination()
    if (folderPath.charAt(0) === 'w' || folderPath.charAt(0) === 'p') {
      getParentFolders(rowData.data_id)
      if (folderPath.charAt(0) === 'w') {
        goToWorkgroupLocation(rowData.data_id, workgroupData)
      } else {
        goToWorkgroupLocation(rowData.data_id, personalData)
      }
    } else if (collapseOption.recycle) {
      if (rowData.type === 'folder') {
        setSafely(setGroupType, rowData.groupType)
        // handleRecycleData(rowData.folderId, rowData.groupType, true)
      }
    }
  }

  const setEnableContextMenu = (className: any) => {
    if (className['animVal'] === undefined) {
      if (className?.split(' ').length > 0) {
        let classArr: any = className.split(' ')
        if (['MuiDataGrid-window', 'MuiDataGrid-footer'].indexOf(classArr[0]) === -1) {
          if (classArr[0] === 'MuiDataGrid-cell') {
            dispatch(setIsContextMenu(true))
          } else {
            let classArr_temp: any = classArr[0].split('-')
            if (
              [
                'folder',
                'file',
                'mediumIcon',
                'fileMediumIcon',
                'mediumViewName',
                'largeIcon',
                'fileLargeIcon',
                'largeViewName',
              ].indexOf(classArr_temp[1]) !== -1
            ) {
              if (classArr_temp[1] === 'fileMediumIcon' || classArr_temp[1] === 'fileLargeIcon') {
                dispatch(setContextFileType('file'))
              } else {
                dispatch(setContextFileType('folder'))
              }

              dispatch(setIsContextMenu(true))
            } else if (['largeIconItem'].indexOf(classArr[1]?.split('-')[1]) !== -1) {
              dispatch(setIsContextMenu(true))
            } else {
              dispatch(setIsContextMenu(false))
              setSelectionModelContextId(null)
            }
          }
        } else {
          dispatch(setIsContextMenu(false))
          setSelectionModelContextId(null)
        }
      }
    }
  }

  const setContextMenuIcon = (e) => {
    let rowData: any = e.target.id.split('-')
    if (e.target.id) {
      dispatch(setCurrentFileName(rowData[1]))
      dispatch(setCurrentFileIdByContext(rowData[0]))
      setSelectionModelContextId(parseInt(rowData[3]))
    }
  }

  const onChangePagination = (page: number, rowPage: number) => {
    setPagination({
      ...pagination,
      current_page: page + 1,
    })
    const reminder = (page * rowPage) % 100
    if (
      (pagination.current_page !== 1 &&
        reminder === 0 &&
        page !== 0 &&
        !pagination.pages.includes(page)) ||
      (rowPage === 100 && !pagination.pages.includes(page))
    ) {
      let pages: number[] = pagination.pages
      pages.push(page)
      setPagination({
        ...pagination,
        pages: pages,
        page: pagination.page + 1,
        per_page: rowPage,
      })
      if (searchMode) {
        setSearchTableData([])
        if (!searchAdvancedFilterData) onSimpleSearch(searchText, pagination.page + 1, 100)
        else onAdancedSearch(searchAdvancedFilterData, pagination.page + 1, 100)
      } else {
        if (folderPath.charAt(0) === 'w' || folderPath.charAt(0) === 'p') {
          getParentFolders(currentParentId)
          if (folderPath.charAt(0) === 'w') {
            goToWorkgroupLocation(currentParentId, workgroupData)
          } else {
            goToWorkgroupLocation(currentParentId, personalData)
          }
        }
      }
    }
  }

  const onChangePerPage = (per_page: number) => {
    setPagination({
      ...pagination,
      current_page: 1,
      pages: [],
      page: 1,
      per_page: per_page,
    })
    if (searchMode) {
      setWorkspaceTableData([])
      if (!searchAdvancedFilterData) onSimpleSearch(searchText, pagination.page + 1, 100)
      else onAdancedSearch(searchAdvancedFilterData, pagination.page + 1, 100)
    } else {
      if (folderPath.charAt(0) === 'w' || folderPath.charAt(0) === 'p') {
        setWorkspaceTableData([])
        getParentFolders(currentParentId)
        if (folderPath.charAt(0) === 'w') {
          goToWorkgroupLocation(currentParentId, workgroupData)
        } else {
          goToWorkgroupLocation(currentParentId, personalData)
        }
      }
    }
  }

  const onSimpleSearch = (searchText: string, page: number, limit: number) => {
    let folderId: number = 0
    let category: UploadCategory = 'workgroup'
    if (folderPath.charAt(0) === 'w') {
      folderId = currentParentId
        ? currentParentId
        : folderPath.charAt(0) === 'w'
        ? workgroupParentId
        : 0
      category = 'workgroup'

      onGetSimpleSearch(searchText, folderId, currentCaseId, category, page, limit)
    } else if (folderPath.charAt(0) === 'p') {
      folderId = currentParentId
        ? currentParentId
        : folderPath.charAt(0) === 'p'
        ? personalParentId
        : 0
      category = 'personal'
      onGetSimpleSearch(searchText, folderId, userId, category, page, limit)
    }
  }

  const onAdancedSearch = (data: any, page: number, limit: number) => {
    let folderId: number = 0
    if (folderPath.charAt(0) === 'w') {
      folderId = currentParentId
        ? currentParentId
        : folderPath.charAt(0) === 'w'
        ? workgroupParentId
        : 0
      onGetAdvancedSearch(data, folderId, currentCaseId, page, limit)
    } else if (folderPath.charAt(0) === 'p') {
      folderId = currentParentId
        ? currentParentId
        : folderPath.charAt(0) === 'p'
        ? personalParentId
        : 0
      onGetAdvancedSearch(data, folderId, userId, page, limit)
    }
  }

  return (
    <Grid
      id="tree"
      container
      className={mode.indexOf(viewMode) === -1 ? classes.root : classes.largeRoot}
    >
      <ReactHoverObserver
        {...{
          className: classes.hoverObserver,
          onMouseOver: ({ e }) => {
            let target = e.target.className
            setEnableContextMenu(target)
          },
          onMouseLeave: () => {
            dispatch(setIsContextMenu(true))
          },
        }}
      >
        {mode.indexOf(viewMode) === -1 && dataColumns.length > 0 && (
          <XGrid
            rows={rowDataList}
            columns={dataColumns}
            components={{
              NoRowsOverlay: NoRowsTableView,
              Footer: FooterStatus,
            }}
            componentsProps={{
              footer: {
                selectedRows: exportData,
                sizeMode: folderPath.charAt(0) !== 's' ? true : false,
              },
              noRowsOverlay: {
                searchMode: searchMode,
              },
            }}
            hideFooterSelectedRowCount={true}
            rowHeight={30}
            checkboxSelection
            disableSelectionOnClick={true}
            paginationMode={'client'}
            pagination
            page={pagination.current_page - 1}
            pageSize={pagination.per_page}
            loading={isLoader}
            rowCount={pagination.total}
            disableColumnSelector={true}
            selectionModel={selectionModelIds}
            onRowSelected={(newSelection) => {
              dispatch(setSelectRowDetail(newSelection.data))
              setExportDataByChecked(newSelection.data)
            }}
            onSelectionModelChange={(newSelection) => {
              if (iconData.length === newSelection.selectionModel.length) {
                let selectionIds: number[] = []
                iconData.map((checkRow: any, index: number) => {
                  selectionIds.push(parseInt(checkRow.id))
                  return checkRow
                })
                setExportData(iconData)
                setSelectionModelId(selectionIds)
                onSetItem(columnsData, iconData)
              } else if (newSelection.selectionModel.length === 0) {
                setExportData([])
                setSelectionModelId([])
                onSetItem(columnsData, [])
              }
            }}
            onColumnOrderChange={(newSelection) => {
              setReorderColumns(newSelection.oldIndex, newSelection.targetIndex)
            }}
            onPageChange={(newSelection) => {
              onChangePagination(newSelection.page, pagination.per_page)
            }}
            onPageSizeChange={(newSelection) => {
              if (pagination.per_page === newSelection.pageSize)
                onChangePagination(pagination.current_page, newSelection.pageSize)
              else onChangePerPage(newSelection.pageSize)
            }}
            onSortModelChange={(newSelection) => {
              sortDataRow(newSelection.sortModel[0])
            }}
            onFilterModelChange={(newSelection) => {
              dispatch(setFilterFlag(true))
              setRowData(Array.from(newSelection.visibleRows.values()))
            }}
            onRowClick={(newSelection) => {
              if (folderPath.charAt(0) === 's') {
                dispatch(setShareUpdateData(newSelection.row))
              }
              dispatch(setSelectRowDetail(newSelection.row))
            }}
            onRowOver={(newSelection) => {
              dispatch(setCurrentFileName(newSelection.row.name))
              dispatch(setCurrentFileIdByContext(newSelection.row.data_id))
              dispatch(setContextFileType(newSelection.row.type))
            }}
            onRowDoubleClick={(newSelection) => {
              onSelectFolder(newSelection.row)
            }}
          />
        )}
        {mode.indexOf(viewMode) !== -1 && (
          <Grid
            container
            className={clsx({
              [classes.large]: iconData.length > 0,
              [classes.noRowlarge]: iconData.length === 0,
            })}
          >
            <Grid
              item
              className={clsx({
                [classes.largeContainer]: iconData.length > 0,
                [classes.largeNoRowContainer]: iconData.length === 0,
              })}
            >
              <Grid container>
                {iconData.length === 0 && (
                  <NoRowsIconView isLoader={isLoader} searchMode={searchMode} />
                )}
                {iconData.length > 0 &&
                  iconData.map((row: any, index: number) => {
                    let folderIcon: any = []
                    let fileIcon: any = []
                    if (row.icon === 'folder') {
                      folderIcon = require(`../../Image/icon_folder.svg`)
                    } else {
                      fileIcon = getFileIconPath(row.fileType)
                    }
                    return (
                      <div
                        className={clsx({
                          [classes.largeIconItemActive]:
                            selectionModelIds.indexOf(parseInt(row.id)) !== -1 ||
                            selectionModelContextId === row.id,
                          [classes.largeIconItem]:
                            selectionModelIds.indexOf(parseInt(row.id)) === -1,
                          [classes.largeIconItemDisable]:
                            selectionModelContextId === row.id && pending.isPending,
                        })}
                        onContextMenu={(e) => setContextMenuIcon(e)}
                        key={index}
                        id={row.data_id + '-' + row.name + '-' + row.type}
                      >
                        {viewMode === 'medium' ? (
                          <>
                            {row.icon === 'folder' ? (
                              <img
                                id={row.data_id + '-' + row.name + '-' + row.type + '-' + row.id}
                                src={folderIcon.default}
                                alt={'folder'}
                                className={classes.mediumIcon}
                                onDoubleClick={() => onSelectFolder(row)}
                              />
                            ) : (
                              <img
                                id={row.data_id + '-' + row.name + '-' + row.type}
                                src={fileIcon}
                                alt={'file'}
                                className={classes.fileMediumIcon}
                                onDoubleClick={() => onSelectFolder(row)}
                              />
                            )}
                            <span
                              id={row.data_id + '-' + row.name + '-' + row.type}
                              className={classes.mediumViewName}
                            >
                              {row.name?.length > 14
                                ? row.name?.substring(0, 11)
                                : row.name?.substring(0, 14)}
                              {row.name?.length > 14 && (
                                <Tooltip
                                  title={row.name ? row.name : ''}
                                  arrow
                                  placement="top"
                                  disableHoverListener={false}
                                >
                                  <MoreHorizIcon className={classes.titleellipsis} />
                                </Tooltip>
                              )}
                            </span>
                            <GreenCheckbox
                              onChange={() => setExportDataByChecked(row)}
                              tabIndex={-1}
                              disableRipple
                              checked={selectionModelIds.indexOf(parseInt(row.id)) !== -1}
                              className={clsx({
                                [classes.mediumIconCheckBoxActive]:
                                  selectionModelIds.indexOf(parseInt(row.id)) !== -1 ||
                                  selectionModelContextId === row.id,
                                [classes.mediumIconCheckBox]:
                                  selectionModelIds.indexOf(parseInt(row.id)) === -1 &&
                                  selectionModelContextId !== row.id,
                              })}
                            />
                          </>
                        ) : (
                          <>
                            {row.icon === 'folder' ? (
                              <img
                                id={row.data_id + '-' + row.name + '-' + row.type + '-' + row.id}
                                src={folderIcon.default}
                                alt={'folder'}
                                className={classes.largeIcon}
                                onDoubleClick={() => onSelectFolder(row)}
                              />
                            ) : (
                              <img
                                id={row.data_id + '-' + row.name + '-' + row.type}
                                src={fileIcon}
                                alt={'file'}
                                className={classes.fileLargeIcon}
                                onDoubleClick={() => onSelectFolder(row)}
                              />
                            )}
                            <span
                              id={row.data_id + '-' + row.name + '-' + row.type}
                              className={classes.largeViewName}
                            >
                              {row.name?.length > 20
                                ? row.name?.substring(0, 14)
                                : row.name?.substring(0, 20)}
                              {row.name?.length > 14 && (
                                <Tooltip
                                  title={row.name ? row.name : ''}
                                  arrow
                                  placement="top"
                                  disableHoverListener={false}
                                >
                                  <MoreHorizIcon className={classes.titleellipsis} />
                                </Tooltip>
                              )}
                            </span>
                            <GreenCheckbox
                              onChange={() => setExportDataByChecked(row)}
                              tabIndex={-1}
                              disableRipple
                              checked={selectionModelIds.indexOf(parseInt(row.id)) !== -1}
                              className={clsx({
                                [classes.largeIconCheckBoxActive]:
                                  selectionModelIds.indexOf(parseInt(row.id)) !== -1 ||
                                  selectionModelContextId === row.id,
                                [classes.largeIconCheckBox]:
                                  selectionModelIds.indexOf(parseInt(row.id)) === -1 &&
                                  selectionModelContextId !== row.id,
                              })}
                            />
                          </>
                        )}
                      </div>
                    )
                  })}
              </Grid>
            </Grid>
          </Grid>
        )}
      </ReactHoverObserver>
      <ShareForm openModal={shareFormOpen} onCloseModal={() => dispatch(setShareFormOpen(false))} />
    </Grid>
  )
}
