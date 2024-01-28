import React, { useState, useEffect, MouseEvent, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import makeStyles from '@material-ui/core/styles/makeStyles'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import { AppState } from 'App/reducers'
import { ReactComponent as UserIcon } from 'Image/user.svg'
import { ReactComponent as TrashIcon } from 'Image/icon_trash_delete.svg'
import { ReactComponent as ShareManageIcon } from 'Image/icon_share_management.svg'
import Tooltip from '@material-ui/core/Tooltip'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { WORKSPACE_URL } from 'Lib'
import { ReactComponent as WorkspaceIcon } from 'Image/workspace.svg'
import { setSubBreadcrumb } from 'Data/Workspace'
import { setFieldNodeId } from 'Data/TableViewDataList'
import { useWorkspaceData } from './useWorkspaceData'
import { useHistory } from 'react-router-dom'
import { WorkspaceGridContext, Store } from 'Workspace'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 0,
  },
  crmbText: {
    'fontSize': '0.8rem',
    'display': 'flex',
    'alignItems': 'center',
    'cursor': 'pointer',
    '&:hover': {
      fontWeight: 'bold',
    },
  },
  wrapIcon: {
    'verticalAlign': 'middle',
    'display': 'inline-flex',
    'alignItems': 'center',
    'fontSize': '0.8rem',
    'cursor': 'pointer',
    '&:hover': {
      fontWeight: 'bold',
    },
  },
  primaryIcon: {
    width: '20px',
    paddingRight: '3px',
  },
  trashIcon: {
    width: '18px',
    paddingRight: '3px',
  },
  titleellipsis: {
    paddingTop: '5px',
  },
  searchTitle: {
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
}))

export function SubBreadcrumb() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const { goToWorkgroupLocation, getParentFolders, clearPagination } = useWorkspaceData()
  const subBreadcrumb = useSelector((state: AppState) => state.workspaceData.subBreadcrumb)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)

  const [breadcrumbData, setBreadcrumData] = useState<any>([])

  const { workgroupData, personalData, folderPath, searchMode } = useContext(
    WorkspaceGridContext
  ) as Store

  useEffect(() => {
    if (subBreadcrumb) {
      setBreadcrumData(subBreadcrumb)
    } else {
      setBreadcrumData([])
    }
  }, [subBreadcrumb, setBreadcrumData])

  const getDataTableList = (event: MouseEvent) => {
    getParentFolders(Number(event.currentTarget.id))
    clearPagination()
    if (folderPath.charAt(0) === 'w') {
      goToWorkgroupLocation(Number(event.currentTarget.id), workgroupData)
    } else if (folderPath.charAt(0) === 'p') {
      goToWorkgroupLocation(Number(event.currentTarget.id), personalData)
    }
  }

  const getDataTableListParent = (event: MouseEvent) => {
    clearPagination()
    if (event.currentTarget.id === 'workgroup') {
      history.push(`${WORKSPACE_URL}/w/${currentCaseId}`)
    } else if (event.currentTarget.id === 'personal') {
      history.push(`${WORKSPACE_URL}/p/`)
    }
    dispatch(setFieldNodeId(0))
    dispatch(setSubBreadcrumb([]))
  }

  return (
    <div>
      {searchMode ? (
        <Typography id={'search'} color="textPrimary" className={classes.searchTitle}>
          Simple Search
        </Typography>
      ) : (
        <Breadcrumbs
          maxItems={2}
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          className={classes.root}
        >
          {folderPath.charAt(0) === 'w' && folderPath.charAt(0) !== 's' && (
            <Typography
              id={'workgroup'}
              color="textPrimary"
              className={classes.wrapIcon}
              onClick={getDataTableListParent}
            >
              <WorkspaceIcon className={classes.primaryIcon} /> Workgroup
            </Typography>
          )}
          {folderPath.charAt(0) === 'p' && folderPath.charAt(0) !== 's' && (
            <Typography
              id={'personal'}
              color="textPrimary"
              className={classes.wrapIcon}
              onClick={getDataTableListParent}
            >
              <UserIcon className={classes.primaryIcon} /> Personal
            </Typography>
          )}
          {folderPath.charAt(0) === 'r' && folderPath.charAt(0) !== 's' && (
            <Typography color="textPrimary" className={classes.wrapIcon}>
              <TrashIcon className={classes.trashIcon} /> Recycle Bin
            </Typography>
          )}
          {folderPath.charAt(0) === 's' && (
            <Typography color="textPrimary" className={classes.wrapIcon}>
              <ShareManageIcon className={classes.trashIcon} /> Share Management
            </Typography>
          )}
          {breadcrumbData?.map((ele: any, index: number) => {
            return (
              <Typography
                className={classes.crmbText}
                id={ele.data_id}
                key={index}
                onClick={getDataTableList}
              >
                {ele.name?.length > 14 && breadcrumbData.length !== index + 1
                  ? ele.name?.substring(0, 11)
                  : ele.name}
                {ele.name?.length > 14 && breadcrumbData.length !== index + 1 && (
                  <Tooltip
                    title={ele.name ? ele.name : ''}
                    arrow
                    placement="top"
                    disableHoverListener={false}
                  >
                    <MoreHorizIcon className={classes.titleellipsis} />
                  </Tooltip>
                )}
              </Typography>
            )
          })}
        </Breadcrumbs>
      )}
    </div>
  )
}
