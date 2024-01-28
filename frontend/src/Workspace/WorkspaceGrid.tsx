import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import { SplitPane } from 'react-collapse-pane'
import Button from '@material-ui/core/Button'
import { ReactComponent as HomeIcon } from 'Image/icon_home.svg'
import { AppState } from 'App/reducers'
import { setCollapseOpen } from 'Data/Workspace'
import { WorkspaceSidebar } from './WorkspaceSidebar'
import { WorkspaceContent } from './WorkspaceContent'
import { WorkspaceDetail } from './WorkspaceDetail'
import IconButton from '@material-ui/core/IconButton'
import { useAxios, useIsMounted, MANAGE_CASES_URL } from 'Lib'
import Alert from '@material-ui/lab/Alert'
import { useQuery } from 'react-query'
import { QueryKey, FolderTreeItem } from 'types'
import { setShareLinkData } from 'Data/Workspace'
import dayjs from 'dayjs'
import { WorkspaceRecycleBinItem } from './types'
import '../../node_modules/@syncfusion/ej2-base/styles/material.css'
import '../../node_modules/@syncfusion/ej2-react-navigations/styles/material.css'
import '../../node_modules/@syncfusion/ej2-inputs/styles/material.css'
import '../../node_modules/@syncfusion/ej2-buttons/styles/material.css'
import { SearchTableDataItem, AdvancedSearchFilterItem, Paginator } from './types'

const useStyles = makeStyles((theme) => ({
  layout: {
    height: 'calc(100% - 100px) !important',
    width: '100%',
  },
  content: {
    width: '100%',
  },
  item: {
    backgroundColor: '#fff',
    marginLeft: '10px',
    height: '100% !important',
    overflow: 'inherit',
  },
  sideBarItem: {
    backgroundColor: '#fff',
    height: '100% !important',
  },
  splitPaneTypeNomal: {
    'position': 'relative',
    'height': 'calc(100% - 100px) !important',
    'width': '100%',
    '& .Pane:nth-of-type(1)': {
      minWidth: '240px',
      overflow: 'hidden',
    },
    '& .Pane:nth-of-type(5)': {
      minWidth: '240px',
    },
    '& .SplitPane': {
      background: '#fff',
      height: 'calc(100%) !important',
    },
    '& .Resizer': {
      left: '5px',
    },
    '& .vertical': {
      overflow: 'unset',
    },
  },
  splitPaneTypeLeft: {
    'position': 'relative',
    'height': 'calc(100% - 100px) !important',
    'width': '100%',
    '& .Resizer': {
      left: '5px',
    },
    '& .Pane:nth-of-type(1)': {
      flexBasis: '60px !important',
      maxWidth: '60px',
      overflow: 'hidden',
    },
    '& .SplitPane': {
      background: '#fff',
      height: 'calc(100%) !important',
    },
    '& .vertical': {
      overflow: 'unset',
    },
  },
  splitPaneTypeRight: {
    'position': 'relative',
    'height': 'calc(100% - 100px) !important',
    'width': '100%',
    '& .Resizer': {
      left: '5px',
    },
    '& .Pane:nth-of-type(1)': {
      minWidth: '240px',
      overflow: 'hidden',
    },
    '& .Pane:nth-of-type(5)': {
      flexBasis: '60px !important',
      maxWidth: '60px',
    },
    '& .SplitPane': {
      background: '#fff',
      height: 'calc(100%) !important',
    },
    '& .vertical': {
      overflow: 'unset',
    },
  },
  splitPaneType: {
    'position': 'relative',
    'height': 'calc(100% - 100px) !important',
    'width': '100%',
    '& .Resizer': {
      left: '5px',
    },
    '& .Pane:nth-of-type(1)': {
      flexBasis: '60px !important',
      maxWidth: '60px',
      overflow: 'hidden',
    },
    '& .Pane:nth-of-type(5)': {
      flexBasis: '60px !important',
      maxWidth: '60px',
    },
    '& .SplitPane ': {
      background: '#fff',
      height: 'calc(100%) !important',
    },
    '& .vertical': {
      overflow: 'unset',
    },
  },
  detailItem: {
    border: '1px solid #5FB158',
    width: 'calc(100% - 20px) !important',
  },
  titleRow: {
    height: '50px',
    backgroundColor: '#5FB158',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft: '8px',
  },
  collapseDetail: {
    'minWidth': '30px',
    'height': '100%',
    '& span': {
      textTransform: 'uppercase',
      fontSize: '20px',
      transform: 'rotate(-180deg)',
      writingMode: 'vertical-rl',
    },
  },
  homeIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5FB158',
    padding: '5px',
    width: '60px',
  },
  homeIcon: {
    width: '30px',
    minWidth: '30px',
  },
  detailContainer: {
    height: '100%',
  },
  searchTextInput: {
    height: '9px',
    fontSize: '14px',
  },
  labelRoot: {
    marginTop: '-3px',
  },
  homeButton: {
    padding: 0,
  },
  alertRow: {
    position: 'absolute',
    marginTop: '-1rem',
  },
  messageTitle: {
    width: '50%',
  },
}))

export interface Store {
  workgroupData: FolderTreeItem[]
  setWorkGroupData: (data: FolderTreeItem[]) => void
  personalData: FolderTreeItem[]
  setPersonalData: (data: FolderTreeItem[]) => void
  workspaceTableData: FolderTreeItem[]
  setWorkspaceTableData: (data: FolderTreeItem[]) => void
  folderPath: string
  setFolderPath: (data: string) => void
  searchMode: boolean
  setSearchMode: (value: boolean) => void
  searchText: string
  setSearchText: (value: string) => void
  searchTableData: SearchTableDataItem[]
  setSearchTableData: (data: SearchTableDataItem[]) => void
  searchAdvancedFilterData: AdvancedSearchFilterItem | null
  setSearchAdvancedFilterData: (data: AdvancedSearchFilterItem | null) => void
  recycleBinData: WorkspaceRecycleBinItem[]
  setWorkspaceRecycleBinData: (data: WorkspaceRecycleBinItem[]) => void
  recycleBinParentIds: number[]
  setRecycleBinParentIds: (data: number[]) => void
  groupType: string
  setGroupType: (type: string) => void
  workspaceRecycleBinTableData: FolderTreeItem[]
  setWorkspaceRecycleBinTableData: (data: FolderTreeItem[]) => void
  pagination: Paginator
  setPagination: (data: Paginator) => void
}

export const WorkspaceGridContext = React.createContext<Store | null>(null)

export function WorkspaceGrid() {
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const axios = useAxios()
  const dispatch = useDispatch()
  const history = useHistory()
  const [isCollapse, setIsCollapse] = useState<boolean>(false)
  const [isDetailCollapse, setIsDetailCollapse] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [errorTitle, setErrorTitle] = useState<string>('')
  const [collapseClass, setCollapsePaneClass] = useState<string>('splitPaneTypeRight')
  const [workgroupData, updateWorkGroupData] = useState<FolderTreeItem[]>([])
  const [personalData, updatePersonalData] = useState<FolderTreeItem[]>([])
  const [workspaceTableData, updateWorkspaceTableDataList] = useState<FolderTreeItem[]>([])
  const [searchMode, updateSearchMode] = useState<boolean>(false)
  const [folderPath, updateFolderPath] = useState<string>('')
  const [searchText, updateSearchText] = useState<string>('')
  const [
    searchAdvancedFilterData,
    updateSearchAdvancedFilterData,
  ] = useState<AdvancedSearchFilterItem | null>(null)
  const [searchTableData, updateSearchTableData] = useState<SearchTableDataItem[]>([])
  const [recycleBinData, updateRecycleBinData] = useState<WorkspaceRecycleBinItem[]>([])
  const [recycleBinParentIds, updateRecycleBinParentIds] = useState<number[]>([])
  const [groupType, updateGroupType] = useState<string>('')
  const [workspaceRecycleBinTableData, updateWorkspaceRecycleBinTableData] = useState<
    FolderTreeItem[]
  >([])
  const [pagination, updatePagination] = useState<Paginator>({
    current_page: 1,
    page: 1,
    pages: [],
    per_page: 25,
    total: 0,
  })
  const caseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const userId = useSelector((state: AppState) => state.user.id)

  const workspaceShareLink = async (): Promise<any> => {
    const { data } = await axios.get(
      `/share/fetch_shared_links?user_id=${userId}&case_id=${caseId}`
    )
    return data
  }

  useQuery(QueryKey.workspaceShareLink, workspaceShareLink, {
    onSuccess: (data) => {
      let shareLinks: any = []
      data.map((ele: any, index: number) => {
        let temp_ele: any = {}
        temp_ele.id = ele.id
        temp_ele.icon = ele.share_type
        temp_ele.userName = ele.email
        temp_ele.name = `${ele.first_name ? ele.first_name : ''} ${
          ele.last_name ? ele.last_name : ''
        }`
        temp_ele.phone = ele.phone
        temp_ele.dateShared = dayjs(ele.create_at).format('YYYY-MM-DD hh:mm A')
        if (ele.share_type === 'upload') temp_ele.accessType = 'Upload'
        else if (ele.share_type === 'download') temp_ele.accessType = 'Download'
        else temp_ele.accessType = 'Share'
        temp_ele.sharedBy = ele.grantedBy.first_name + ' ' + ele.grantedBy.last_name
        temp_ele.expiration =
          ele.expires_at !== null ? dayjs(ele.expires_at).format('YYYY-MM-DD hh:mm A') : null
        temp_ele.lastLogin =
          ele.last_login !== null
            ? dayjs(ele.last_login).format('YYYY-MM-DD hh:mm A')
            : 'Never Logged In'
        temp_ele.detail = ele
        shareLinks.push(temp_ele)
        return ele
      })
      dispatch(setShareLinkData(shareLinks))
    },
  })

  const handleSidebarCollapse = (collapse: boolean) => {
    if (collapse === true && isDetailCollapse === false) {
      setCollapsePaneClass('splitPaneTypeLeft')
    } else if (collapse === false && isDetailCollapse === true) {
      setCollapsePaneClass('splitPaneTypeRight')
    } else if (collapse === true && isDetailCollapse === true) {
      setCollapsePaneClass('splitPaneType')
    } else {
      setCollapsePaneClass('splitPaneTypeNormal')
    }
    setIsCollapse(collapse)
    dispatch(setCollapseOpen(collapse))
  }

  const handleDetailCollapse = (collapse: boolean) => {
    if (isCollapse === true && collapse === false) {
      setCollapsePaneClass('splitPaneTypeLeft')
    } else if (isCollapse === false && collapse === true) {
      setCollapsePaneClass('splitPaneTypeRight')
    } else if (isCollapse === true && collapse === true) {
      setCollapsePaneClass('splitPaneType')
    } else {
      setCollapsePaneClass('splitPaneTypeNormal')
    }
    setIsDetailCollapse(collapse)
  }

  const openError = (isError: boolean, title: string) => {
    setSafely(setIsError, isError)
    setSafely(setErrorTitle, title)
  }

  const generateDOM = () => {
    return [
      <Box className={classes.sideBarItem} key={'sidebar'}>
        <WorkspaceSidebar handleCollapse={handleSidebarCollapse} isCollapse={isCollapse} />
      </Box>,
      <Box className={classes.item} key={'content'}>
        <WorkspaceContent
          openError={(isError: boolean, title: string) => openError(isError, title)}
        />
      </Box>,
      <Box className={classes.item} key={'detail'}>
        {!isDetailCollapse && (
          <Box className={classes.detailContainer}>
            <WorkspaceDetail handleDetailCollapse={handleDetailCollapse} />
          </Box>
        )}

        {isDetailCollapse && (
          <Button
            className={classes.collapseDetail}
            variant="outlined"
            fullWidth
            color="primary"
            size="large"
            onClick={(e) => handleDetailCollapse(false)}
          >
            Detail, Viewer, Tags & Notes
          </Button>
        )}
      </Box>,
    ]
  }

  const resizerOption = {
    css: {
      width: '10px',
      background: '#ececec',
    },
    hoverCss: {
      width: '10px',
      background: '#ececec',
    },
    grabberSize: '0.3rem',
  }

  var collapseClassName: string = ''

  if (collapseClass === 'splitPaneTypeNormal') {
    collapseClassName = classes.splitPaneTypeNomal
  } else if (collapseClass === 'splitPaneTypeRight') {
    collapseClassName = classes.splitPaneTypeRight
  } else if (collapseClass === 'splitPaneTypeLeft') {
    collapseClassName = classes.splitPaneTypeLeft
  } else {
    collapseClassName = classes.splitPaneType
  }

  const toManageCase = () => {
    history.push(MANAGE_CASES_URL)
  }

  const setWorkGroupData = (data: FolderTreeItem[]) => {
    setSafely(updateWorkGroupData, data)
  }

  const setPersonalData = (data: FolderTreeItem[]) => {
    setSafely(updatePersonalData, data)
  }

  const setWorkspaceTableData = (data: FolderTreeItem[]) => {
    setSafely(updateWorkspaceTableDataList, data)
  }

  const setFolderPath = (path: string) => {
    setSafely(updateFolderPath, path)
  }

  const setSearchMode = (value: boolean) => {
    setSafely(updateSearchMode, value)
  }

  const setSearchText = (value: string) => {
    setSafely(updateSearchText, value)
  }

  const setSearchTableData = (data: SearchTableDataItem[]) => {
    setSafely(updateSearchTableData, data)
  }

  const setSearchAdvancedFilterData = (data: any) => {
    setSafely(updateSearchAdvancedFilterData, data)
  }

  const setWorkspaceRecycleBinData = (data: WorkspaceRecycleBinItem[]) => {
    setSafely(updateRecycleBinData, data)
  }

  const setRecycleBinParentIds = (parentIds: number[]) => {
    setSafely(updateRecycleBinParentIds, parentIds)
  }

  const setGroupType = (type: string) => {
    setSafely(updateGroupType, type)
  }

  const setWorkspaceRecycleBinTableData = (data: FolderTreeItem[]) => {
    setSafely(updateWorkspaceRecycleBinTableData, data)
  }

  const setPagination = (data: Paginator) => {
    setSafely(updatePagination, data)
  }

  return (
    <WorkspaceGridContext.Provider
      value={{
        workgroupData,
        setWorkGroupData,
        personalData,
        setPersonalData,
        workspaceTableData,
        setWorkspaceTableData,
        folderPath,
        setFolderPath,
        searchMode,
        setSearchMode,
        searchText,
        setSearchText,
        searchTableData,
        setSearchTableData,
        searchAdvancedFilterData,
        setSearchAdvancedFilterData,
        recycleBinData,
        setWorkspaceRecycleBinData,
        recycleBinParentIds,
        setRecycleBinParentIds,
        groupType,
        setGroupType,
        workspaceRecycleBinTableData,
        setWorkspaceRecycleBinTableData,
        pagination,
        setPagination,
      }}
    >
      <Grid className={collapseClassName} key={'splitpane'}>
        {isError && (
          <Grid container justify="center" className={classes.alertRow}>
            <Grid container item justify="center">
              <Alert
                severity="error"
                className={classes.messageTitle}
                onClose={() => setSafely(setIsError, false)}
              >
                {errorTitle}
              </Alert>
            </Grid>
          </Grid>
        )}
        <Grid container justify={'space-between'} alignItems="center">
          <Grid item className={classes.homeIconWrapper}>
            <IconButton className={classes.homeButton} onClick={() => toManageCase()}>
              <HomeIcon className={classes.homeIcon} />
            </IconButton>
          </Grid>
        </Grid>
        <SplitPane split="vertical" initialSizes={[1, 6, 1]} resizerOptions={resizerOption}>
          {generateDOM()}
        </SplitPane>
      </Grid>
    </WorkspaceGridContext.Provider>
  )
}
