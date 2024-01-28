import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useMutation, useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { StatusContext } from 'App/StatusProvider'
import { AppState } from 'App/reducers'
import { UploadProvider } from 'Upload/UploadProvider'
import { setSelectedFolders, setSelectRowDetail, setTableViewMode } from 'Data/TableViewDataList'
import {
  setCollapseOption,
  setSubBreadcrumb,
  setPendingNotification,
  setSearchFlag,
  setIsLoader,
} from 'Data/Workspace'
import { useWorkspaceData } from './useWorkspaceData'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Collapse from '@material-ui/core/Collapse'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ClearIcon from '@material-ui/icons/Clear'

/** UI */
import { FieldListMenu, FieldMenu, SwitchViewMenu, ShareListMenu, NoRowIcon } from 'UI'
import { WorkspaceTable } from './WorkspaceTable/WorkspaceTable'
import { ReactComponent as CreateFolderIcon } from 'Image/icon_create_folder.svg'
import { ReactComponent as UploadDownloadIcon } from 'Image/icon_upload_download.svg'
import { ReactComponent as TrashIcon } from 'Image/icon_trash_delete.svg'
import { ReactComponent as SearchIcon } from 'Image/icon_viewer.svg'
import { ReactComponent as NoteAddIcon } from 'Image/icon_reports.svg'
import { WorkspaceShareForm } from './WorkspaceShareForm'
import { WorkspaceAdvancedSearch } from './WorkspaceAdvancedSearch'
import { WorkspaceRenameForm } from './WorkspaceRenameForm'
import { SubBreadcrumb } from './SubBreadcrumb'
import { FieldCells } from './DumyData'
import { Upload } from '../Upload/Upload'

/** Helpers */
import { useIsMounted, useAxios, useFileDownload, WORKSPACE_URL } from 'Lib'
import {
  Folder,
  QueryKey,
  CreateWorkGroupFolderBody,
  UpdateWorkGroupFolderStatusBody,
  CreatePersonalFolderBody,
  UpdatePersonalFolderStatusBody,
  UpdateWorkGroupFileStatusBody,
  UpdatePersonalFileStatusBody,
  UploadCategory,
  CollapseOption,
} from 'types'

import cuid from 'cuid'
import { WorkspaceGridContext, Store } from 'Workspace'
import debounce from 'lodash/debounce'
import { DeleteFileJobParams } from './types'

const useStyles = makeStyles((theme) => ({
  root: {
    'flexGrow': 1,
    'height': '100%',
    '& .MuiCollapse-wrapperInner': {
      borderBottom: '2px solid #5FB158',
    },
  },
  control: {
    padding: theme.spacing(2),
  },
  titleRow: {
    'height': '40px',
    'backgroundColor': '#5FB158',
    '& .MuiSvgIcon-root': {
      fill: 'black',
    },
  },
  fieldListIcon: {
    paddingLeft: '10px',
  },
  toolBarIcon: {
    width: '20px',
  },
  divider: {
    height: '25px',
    width: '2px',
    backgroundColor: '#000000',
    marginTop: '8px',
    marginLeft: '10px',
  },
  contentContainer: {
    height: '100%',
  },
  viewContainer: {
    'height': 'calc(100% - 40px)',
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
  toolbarContainer: {
    borderBottom: '2px solid #5FB158',
    minHeight: '30px',
    padding: '0 10px',
  },
  createFolder: {
    marginRight: '10px',
    fill: '#4472C4',
    width: '22px',
    cursor: 'pointer',
  },
  uploadDownload: {
    fill: '#4472C4',
    width: '24px',
    cursor: 'pointer',
  },
  trash: {
    fill: '#4472C4',
    width: '16px',
    cursor: 'pointer',
  },
  trashLeftBorder: {
    background: '#4472C4',
    margin: '6px 5px',
  },
  headerIcon: {
    padding: '3px 6px',
  },
  advancedSearchContainer: {
    position: 'relative',
    minheight: '250px',
  },
  contentToolbarTitle: {
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  collapseIcon: {
    float: 'right',
  },
  expandLessIcon: {
    position: 'absolute',
    right: 0,
    top: '-10px',
  },
  restoreButton: {
    background: '#4472C4',
    color: '#ffffff',
    borderRadius: '20px',
    height: '25px',
    marginRight: '8px',
    textTransform: 'capitalize',
  },
  noRowIcon: {
    display: 'block',
    height: 'calc(100% - 200px)',
    transform: 'translate(0, 50%)',
  },
  toolIconWrapper: {
    top: '-35px',
    right: '-3px',
    position: 'absolute',
    display: 'flex',
  },
  searchOption: {
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
  searchClearIcon: {
    position: 'absolute',
    left: '166px',
    top: '6px',
    fontSize: '18px',
    fill: '#5FB158',
    cursor: 'pointer',
  },
  searchTextInput: {
    height: '9px',
    fontSize: '14px',
  },
  labelRoot: {
    marginTop: '-3px',
  },
  labelFocused: {
    marginTop: '0px',
  },
  toolIconButton: {
    backgroundColor: '#5FB158',
    borderRadius: '10%',
    height: '30px',
    padding: '7px',
    margin: '0 5px 0 5px',
  },
  toolIcon: {
    width: '15px',
    fill: 'white',
  },
}))

interface ContentToolbarProps {
  title: string
  selectFieldList: any
  exportData: any
  onError: (errorTitle: string) => void
}

const ContentToolbar = (props: ContentToolbarProps) => {
  const { title, onError, exportData } = props
  const classes = useStyles()
  const axios = useAxios()
  const queryClient = useQueryClient()
  const { getRecycleBinData, getWorkspaceFolderStructure, clearPagination } = useWorkspaceData()
  const dispatch = useDispatch()
  const { setSafely } = useIsMounted()
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const [category, setCategory] = React.useState<UploadCategory>('')
  const [folderId, setFolderId] = React.useState<number>(0)
  const [open, setOpen] = React.useState(false)
  const [renameModalOpen, setRenameModalOpen] = React.useState(false)
  const { showStatus } = useContext(StatusContext)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const workgroupParentId = useSelector((state: AppState) => state.workspaceData.workgroupParentId)
  const personalParentId = useSelector((state: AppState) => state.workspaceData.personalParentId)
  const collapseOption = useSelector((state: AppState) => state.workspaceData.collapseOption)

  const currentParentId = useSelector((state: AppState) => state.tableViewData.fieldNodeId)
  const userId = useSelector((state: AppState) => state.user.id)

  const { folderPath, workspaceTableData } = useContext(WorkspaceGridContext) as Store
  const { onFileDownload } = useFileDownload(collapseOption)

  let categoryId: number = 0
  const filenames = ['foo.png']
  if (folderPath.charAt(0) === 'w') {
    categoryId = currentCaseId
  } else if (folderPath.charAt(0) === 'p') {
    categoryId = userId
  }
  let folder_id: number = 0
  useEffect(() => {
    if (folderPath.charAt(0) === 'w') {
      setCategory('workgroup')
    } else if (folderPath.charAt(0) === 'p') {
      setCategory('personal')
    } else {
      setCategory('workgroup')
    }
    setFolderId(currentParentId)
  }, [collapseOption, currentParentId])

  if (!folderId) {
    if (folderPath.charAt(0) === 'w') {
      folder_id = workgroupParentId
    } else if (folderPath.charAt(0) === 'p') {
      folder_id = personalParentId
    }
  } else {
    folder_id = folderId
  }

  const openUpload = () => {
    setSafely(setOpen, true)
    setSafely(setAnchorEl, null)
  }

  const onClose = () => {
    setSafely(setOpen, false)
  }

  const onFechData = () => {
    clearPagination()
    getWorkspaceFolderStructure(folderPath, folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal')
  }

  const openUploadDownloadMenu = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }
  const closeUploadDownloadMenu = () => {
    setSafely(setAnchorEl, null)
  }
  const downloadData = () => {
    onFileDownload(exportData)
  }

  const addNewFolder = async (params: object): Promise<Folder> => {
    let pending: any = {
      isPending: true,
      pendingText: 'Creating',
      isDone: false,
    }
    dispatch(setPendingNotification(pending))
    let data: any = []
    if (folderPath.charAt(0) === 'w') {
      data = await axios.post('/workgroup/folder/create ', params)
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.post('/personal/folder/create', params)
    }
    return data
  }

  const mutation = useMutation(addNewFolder, {
    onSuccess: (data) => {
      getWorkspaceFolderStructure(
        folderPath,
        folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
      )
      let pending: any = {
        isPending: false,
        pendingText: 'Creating',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A new folder was successfully added!')
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Creating',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A new folder could not be added, please try again', 'error')
    },
  })

  const onAddNewFolder = (newName: string) => {
    clearPagination()
    setRenameModalOpen(false)
    if (folderPath.charAt(0) === 'w') {
      const params: CreateWorkGroupFolderBody = {
        caseId: currentCaseId,
        parentId: currentParentId
          ? currentParentId
          : folderPath.charAt(0) === 'w'
          ? workgroupParentId
          : null,
        name: newName,
      }
      mutation.mutate(params)
    } else if (folderPath.charAt(0) === 'p') {
      const params: CreatePersonalFolderBody = {
        userId: userId,
        parentId: currentParentId
          ? currentParentId
          : folderPath.charAt(0) === 'p'
          ? personalParentId
          : null,
        name: newName,
      }
      mutation.mutate(params)
    }
  }

  const deleteFolderById = async (params: object): Promise<Folder> => {
    let data: any = []
    if (params['rowId'] === 0) {
      let pending: any = {
        isPending: true,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
    }
    if (folderPath.charAt(0) === 'w') {
      data = await axios.put('/workgroup/folder/update', params['fileData'])
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.put('/personal/folder/update', params['fileData'])
    }
    data.rowId = params['rowId']
    return data
  }

  const mutationDeleteFolder = useMutation(deleteFolderById, {
    onSuccess: (data) => {
      if (data['rowId'] === exportData.length - 1) {
        getWorkspaceFolderStructure(
          folderPath,
          folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
        )
        let pending: any = {
          isPending: false,
          pendingText: 'Deleting',
          isDone: false,
        }
        dispatch(setPendingNotification(pending))
        showStatus('Deleted successfully.')
        dispatch(setSelectedFolders([]))
      }
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A folder could not be deleted, please try again', 'error')
      dispatch(setSelectedFolders([]))
    },
  })

  const deleteFileById = async (params: object): Promise<Folder> => {
    let data: any = []
    if (params['rowId'] === 0) {
      let pending: any = {
        isPending: true,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
    }
    if (folderPath.charAt(0) === 'w') {
      data = await axios.put('/workgroup/file/update', params['fileData'])
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.put('/personal/file/update', params['fileData'])
    }
    data.rowId = params['rowId']
    return data
  }

  const mutationDeleteFile = useMutation(deleteFileById, {
    onSuccess: (data) => {
      if (data['rowId'] === exportData.length - 1) {
        let pending: any = {
          isPending: false,
          pendingText: 'Deleting',
          isDone: false,
        }
        getWorkspaceFolderStructure(
          folderPath,
          folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
        )
        dispatch(setPendingNotification(pending))
        showStatus('Deleted successfully!')
        dispatch(setSelectedFolders([]))
      }
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A file could not be deleted, please try again', 'error')
      dispatch(setSelectedFolders([]))
    },
  })

  const deleteFolder = () => {
    clearPagination()
    if (exportData.length === 0) {
      onError('Please select folder(s)/file(s)')
      return
    }
    if (folderPath.charAt(0) === 'w') {
      exportData.map((ele: any, index: number) => {
        if (ele.type === 'file') {
          const params: UpdateWorkGroupFileStatusBody = {
            caseId: currentCaseId,
            fileIds: [ele.data_id],
            status: 'trashed',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationDeleteFile.mutate(updateParams)
        } else if (ele.type === 'folder') {
          const params: UpdateWorkGroupFolderStatusBody = {
            caseId: currentCaseId,
            folderId: ele.data_id,
            status: 'trashed',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationDeleteFolder.mutate(updateParams)
        }
        return ele
      })
    } else if (folderPath.charAt(0) === 'p') {
      exportData.map((ele: any, index: number) => {
        if (ele.type === 'file') {
          const params: UpdatePersonalFileStatusBody = {
            userId: userId,
            fileIds: [ele.data_id],
            status: 'trashed',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationDeleteFile.mutate(updateParams)
        } else if (ele.type === 'folder') {
          const params: UpdatePersonalFolderStatusBody = {
            userId: userId,
            folderId: ele.data_id,
            status: 'trashed',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationDeleteFolder.mutate(updateParams)
        }
        return ele
      })
    }
  }

  const permanentDeleteFile = async (params: any): Promise<Folder> => {
    let data: any = []
    if (params['rowId'] === 0) {
      let pending: any = {
        isPending: true,
        pendingText: 'Deleting...',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
    }
    data = await axios.post('/files/delete_trash', params['fileData'])
    data = params
    data.rowId = params['rowId']
    return data
  }

  const mutationPermanentDeleteFile = useMutation(permanentDeleteFile, {
    onSuccess: (data: any) => {
      if (data['rowId'] === exportData.length - 1) {
        let pending: any = {
          isPending: false,
          pendingText: 'Deleting...',
          isDone: false,
        }
        dispatch(setPendingNotification(pending))
        showStatus('Deleted successfully!')
        getRecycleBinData()
        dispatch(setSelectedFolders([]))
      }
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Restoring',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A file could not be deleted, please try again', 'error')
    },
  })

  const permanentDelete = () => {
    if (exportData.length === 0) {
      onError('Please select folder(s)/file(s)')
    }
    exportData.map((ele: any, index: number) => {
      const params: DeleteFileJobParams = {
        id: ele.type === 'file' ? ele.fileId : ele.folderId,
        type: ele.type === 'file' ? 'file' : 'folder',
        category: ele.groupType === 'work' ? 'workgroup' : 'personal',
      }
      let updateParams: any = {
        fileData: params,
        rowId: index,
      }
      mutationPermanentDeleteFile.mutate(updateParams)
      return ele
    })
  }

  const restoreFolderById = async (params: any): Promise<Folder> => {
    let data: any = []
    if (params['rowId'] === 0) {
      let pending: any = {
        isPending: true,
        pendingText: 'Restoring',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
    }
    if (!params['fileData'].userId) {
      data = await axios.put('/workgroup/folder/update', params['fileData'])
    } else {
      data = await axios.put('/personal/folder/update', params['fileData'])
    }
    data.rowId = params['rowId']
    return data
  }

  const mutationRestoreFolder = useMutation(restoreFolderById, {
    onSuccess: (data: any) => {
      if (data['rowId'] === exportData.length - 1) {
        let pending: any = {
          isPending: false,
          pendingText: 'Restoring',
          isDone: false,
        }
        getWorkspaceFolderStructure(
          folderPath,
          folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
        )
        getRecycleBinData()
        dispatch(setPendingNotification(pending))
        showStatus('Restored Successfully')
        dispatch(setSelectedFolders([]))
      }
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Restoring',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A folder could not be restored, please try again', 'error')
    },
  })

  const restoreFileById = async (params: any): Promise<Folder> => {
    let data: any = []
    if (params['rowId'] === 0) {
      let pending: any = {
        isPending: true,
        pendingText: 'Restoring',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
    }
    if (!params['fileData'].userId) {
      data = await axios.put('/workgroup/file/update', params['fileData'])
    } else {
      data = await axios.put('/personal/file/update', params['fileData'])
    }
    data = params
    data.rowId = params['rowId']
    return data
  }

  const mutationRestoreFile = useMutation(restoreFileById, {
    onSuccess: (data: any) => {
      if (data['rowId'] === exportData.length - 1) {
        getWorkspaceFolderStructure(
          folderPath,
          folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
        )
        getRecycleBinData()
        let pending: any = {
          isPending: false,
          pendingText: 'Restoring',
          isDone: false,
        }
        dispatch(setPendingNotification(pending))
        showStatus('Restored successfully!')
        dispatch(setSelectedFolders([]))
      }
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Restoring',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A file could not be restored, please try again', 'error')
      dispatch(setSelectedFolders([]))
    },
  })

  const restoreFolder = () => {
    if (exportData.length === 0) {
      onError('Please select folder(s)/file(s)')
    }
    exportData.map((ele: any, index: number) => {
      if (ele.groupType === 'work') {
        if (ele.type === 'file') {
          const params: UpdateWorkGroupFileStatusBody = {
            caseId: currentCaseId,
            fileIds: [ele.fileId],
            status: 'active',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationRestoreFile.mutate(updateParams)
        } else {
          const params: UpdateWorkGroupFolderStatusBody = {
            caseId: currentCaseId,
            folderId: ele.folderId,
            status: 'active',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationRestoreFolder.mutate(updateParams)
        }
      } else {
        if (ele.type === 'file') {
          const params: UpdatePersonalFileStatusBody = {
            userId: userId,
            fileIds: [ele.fileId],
            status: 'active',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationRestoreFile.mutate(updateParams)
        } else {
          const params: UpdatePersonalFolderStatusBody = {
            userId: userId,
            folderId: ele.folderId,
            status: 'active',
          }
          let updateParams: any = {
            fileData: params,
            rowId: index,
          }
          mutationRestoreFolder.mutate(updateParams)
        }
      }
      return ele
    })
  }

  const deleteShareLink = () => {
    if (exportData.length === 0) {
      onError('Please select share link(s)')
    }
    exportData.map((ele: any, index: number) => {
      let updateParams: any = {
        linkId: ele.id,
        rowId: index,
      }
      mutationDeleteShareLink.mutate(updateParams)
      return ele
    })
  }

  const deleteShareLinkById = async (params: any): Promise<any> => {
    let data: any = []
    if (params['rowId'] === 0) {
      let pending: any = {
        isPending: true,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
    }
    data = await axios.delete(`/share/delete_link/${params['linkId']}`)
    data.rowId = params['rowId']
    return data
  }

  const mutationDeleteShareLink = useMutation(deleteShareLinkById, {
    onSuccess: (data) => {
      if (data['rowId'] === exportData.length - 1) {
        let pending: any = {
          isPending: false,
          pendingText: 'Deleting',
          isDone: false,
        }
        queryClient.refetchQueries([QueryKey.workspaceShareLink])
        dispatch(setPendingNotification(pending))
        showStatus('Deleted successfully!')
      }
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A link could not be deleted, please try again', 'error')
    },
  })

  return (
    <>
      <Grid
        container
        className={classes.toolbarContainer}
        justify={'space-between'}
        alignItems={'center'}
      >
        <Grid item className={classes.contentToolbarTitle}>
          {!title ? <SubBreadcrumb /> : title}
        </Grid>
        {folderPath.charAt(0) !== 'r' &&
          (folderPath.charAt(0) === 'w' || folderPath.charAt(0) === 'p') && (
            <Grid item style={{ display: 'flex' }}>
              <CreateFolderIcon
                className={classes.createFolder}
                onClick={() => setSafely(setRenameModalOpen, true)}
              />

              <UploadDownloadIcon
                className={classes.uploadDownload}
                onClick={openUploadDownloadMenu}
              />
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={closeUploadDownloadMenu}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <MenuItem onClick={() => openUpload()}> Upload </MenuItem>
                <MenuItem onClick={() => downloadData()}> Download </MenuItem>
              </Menu>
              <Divider orientation="vertical" flexItem className={classes.trashLeftBorder} />
              <TrashIcon className={classes.trash} onClick={() => deleteFolder()} />
            </Grid>
          )}
        {folderPath.charAt(0) === 'r' && (
          <Grid item style={{ display: 'flex' }}>
            <Button
              variant="contained"
              size="small"
              className={classes.restoreButton}
              onClick={() => restoreFolder()}
            >
              Restore
            </Button>
            <Divider orientation="vertical" flexItem className={classes.trashLeftBorder} />
            <TrashIcon className={classes.trash} onClick={() => permanentDelete()} />
          </Grid>
        )}
        {folderPath.charAt(0) === 's' && (
          <Grid item style={{ display: 'flex' }}>
            <TrashIcon className={classes.trash} onClick={() => deleteShareLink()} />
          </Grid>
        )}
      </Grid>
      {open && (
        <UploadProvider>
          <Upload
            category={category}
            categoryId={categoryId}
            folderId={folder_id}
            filenames={filenames}
            display="modal"
            trigger="#upload"
            open={open}
            onRequestClose={onClose}
            onFechData={onFechData}
          />
        </UploadProvider>
      )}
      {renameModalOpen && (
        <WorkspaceRenameForm
          onSetCreateName={(newName: string) => onAddNewFolder(newName)}
          onSetRenameName={(newName: string) => onAddNewFolder(newName)}
          open={renameModalOpen}
          onCloseModal={() => setRenameModalOpen(false)}
          currentName={''}
          subDataList={workspaceTableData}
          isAddFolder={true}
        />
      )}
    </>
  )
}

interface WorkspaceContentProps {
  openError: (isError: boolean, title: string) => void
}

export function WorkspaceContent(props: WorkspaceContentProps) {
  const { openError } = props
  const { setSafely } = useIsMounted()
  const dispatch = useDispatch()
  const history = useHistory()
  const { onGetSimpleSearch, clearPagination, getWorkspaceFolderStructure } = useWorkspaceData()
  const [fieldList, setFieldListData] = useState<any>([])
  const [exportData, setExportData] = useState<any>([])
  const [fieldItemList, setFieldItemList] = useState<any[]>([])
  // const [tableViewMode, setTableViewMode] = useState<boolean>(false)
  const [identifier, setIdentifier] = useState('')
  const [advancedOption, setAdvancedOption] = useState<any>([])
  const [advancedTitle, setAdvancedTitle] = useState<any>(advancedOption ? advancedOption : [])
  const classes = useStyles()
  const fieldNodeId = useSelector((state: AppState) => state.tableViewData.fieldNodeId)
  const collapseOption = useSelector((state: AppState) => state.workspaceData.collapseOption)
  const currentParentId = useSelector((state: AppState) => state.tableViewData.fieldNodeId)
  const workgroupParentId = useSelector((state: AppState) => state.workspaceData.workgroupParentId)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const personalParentId = useSelector((state: AppState) => state.workspaceData.personalParentId)
  const searchFlag = useSelector((state: AppState) => state.workspaceData.searchFlag)
  const userId = useSelector((state: AppState) => state.user.id)
  const tableViewMode = useSelector((state: AppState) => state.tableViewData.tableViewMode)

  const {
    setWorkspaceTableData,
    folderPath,
    setSearchMode,
    searchMode,
    setSearchText,
    searchText,
    setSearchTableData,
    setSearchAdvancedFilterData,
    pagination,
  } = useContext(WorkspaceGridContext) as Store

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
    }
    setFieldItemList(fieldListData.fieldList)
    dispatch(setTableViewMode(true))
  }, [searchMode, collapseOption, setFieldItemList, folderPath])

  useEffect(() => {
    setExportData([])
    setAdvancedTitle([])
  }, [fieldNodeId])

  useEffect(() => {
    setAdvancedTitle(advancedOption)
    setSearchAdvancedFilterData(null)
  }, [advancedOption])

  const onSetItem = (listData: any, exportData: any) => {
    setSafely(setFieldListData, listData)
    setSafely(setExportData, exportData)
    if (exportData.length !== 0) {
      openError(false, '')
    } else {
      setSafely(setAdvancedTitle, [])
    }
  }

  const onChangeShareMode = (mode: string) => {
    let shareDetail: any = []
    if (mode === 'management') {
      let optionList: CollapseOption = {
        workgroup: false,
        personal: false,
        share: true,
        recycle: false,
      }
      setWorkspaceTableData([])
      dispatch(setSubBreadcrumb([]))
      dispatch(setSelectedFolders([]))
      dispatch(setCollapseOption(optionList))
      setSearchMode(false)
      setAdvancedOption('')
      dispatch(setSelectRowDetail([]))
      if (folderPath.charAt(0) !== 's') history.push(`${WORKSPACE_URL}/s`)
    } else if (exportData.length === 0 && mode !== 'management') {
      openError(true, 'Please select file(s)/folder(s) to send link')
    } else {
      setSafely(setIdentifier, cuid.slug())
      if (mode === 'download') {
        const folderData = exportData.filter((s: any) => s.type === 'folder')
        if (folderData.length > 0) {
          openError(true, 'Please only select files.')
          return
        }
        shareDetail.title = 'Secure Download Link'
        shareDetail.type = 'download'
      } else if (mode === 'upload') {
        const fileData = exportData.filter((s: any) => s.type === 'file')
        if (exportData.length > 1) {
          openError(true, 'Please only select a folder.')
          return
        } else if (fileData.length > 0) {
          openError(true, 'You may only share a folder.')
          return
        }
        shareDetail.title = 'Secure Upload Link'
        shareDetail.type = 'upload'
      }
      setAdvancedOption(shareDetail)
    }
  }

  const onSetSearchMode = () => {
    if (searchFlag && searchMode) {
      clearPagination()
      getWorkspaceFolderStructure(
        folderPath,
        folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
      )
    }
    setSearchText('')
    setSearchTableData([])
    setSearchMode(false)
    dispatch(setSearchFlag(!searchFlag))
  }

  const debouncedSave = useCallback(
    debounce(
      (nextValue: string, pathString: string, parentId: number) =>
        onSimpleSearch(nextValue, pathString, parentId),
      500
    ),
    []
  )

  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearPagination()
    const { value: nextValue } = event.target
    if (event.target.value !== '' && event.target.value !== undefined) {
      setSearchMode(true)
      setSearchText(nextValue)
      debouncedSave(nextValue, folderPath, currentParentId)
    }
    if (event.target.value === '') {
      getWorkspaceFolderStructure(
        folderPath,
        folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
      )
      dispatch(setIsLoader(false))
      setSearchText('')
      setSearchMode(false)
      setSearchTableData([])
    }
  }

  const handelClearSearch = () => {
    clearPagination()
    getWorkspaceFolderStructure(folderPath, folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal')
    setSearchText('')
    setSearchMode(false)
    setSearchTableData([])
  }

  const onSimpleSearch = (searchText: string, pathString: string, parentId: number) => {
    setSearchTableData([])
    let folderId: number = 0
    let category: UploadCategory = 'workgroup'

    if (pathString.charAt(0) === 'w') {
      folderId = parentId ? parentId : folderPath.charAt(0) === 'w' ? workgroupParentId : 0
      category = 'workgroup'

      onGetSimpleSearch(searchText, folderId, currentCaseId, category, pagination.current_page, 100)
    } else if (pathString.charAt(0) === 'p') {
      folderId = parentId ? parentId : folderPath.charAt(0) === 'p' ? personalParentId : 0
      category = 'personal'
      onGetSimpleSearch(searchText, folderId, userId, category, pagination.current_page, 100)
    }
  }

  const handleChange = (ev: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    let advancedOption: any = []
    advancedOption.title = 'Advanced Search'
    advancedOption.type = 'Search'
    clearPagination()
    setSearchMode(false)
    setSearchTableData([])
    setSearchText('')
    if (ev.target.value === 'advanced') {
      setSafely(setAdvancedOption, advancedOption)
    } else {
      getWorkspaceFolderStructure(
        folderPath,
        folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
      )
      setSafely(setAdvancedOption, [])
    }
  }

  const handleClickAdcanced = () => {
    clearPagination()
    getWorkspaceFolderStructure(folderPath, folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal')
    setSafely(setAdvancedOption, [])
    setSearchTableData([])
    setSearchText('')
    setSearchMode(false)
  }

  return (
    <>
      <Grid container className={classes.root}>
        <Grid item xs={12} className={classes.contentContainer}>
          <Grid container alignItems="center" className={classes.titleRow}>
            <Grid item className={classes.fieldListIcon}>
              <FieldListMenu fieldItemList={fieldItemList} FieldItems={FieldMenu} />
            </Grid>
            <Divider orientation="vertical" flexItem className={classes.divider} />
            <Grid item className={classes.fieldListIcon}>
              <SwitchViewMenu />
            </Grid>
            <Divider orientation="vertical" flexItem className={classes.divider} />
            <Grid item className={classes.fieldListIcon}>
              <ShareListMenu onChangeShareMode={(mode: string) => onChangeShareMode(mode)} />
            </Grid>
            <Divider orientation="vertical" flexItem className={classes.divider} />
            <Grid item className={classes.toolIconWrapper}>
              {searchFlag && (
                <Grid item className={classes.searchOption}>
                  <TextField
                    id="search"
                    name="search"
                    label="Search"
                    type="text"
                    variant="outlined"
                    size="small"
                    disabled={advancedTitle['type'] !== 'Search' ? false : true}
                    InputProps={{ classes: { input: classes.searchTextInput } }}
                    InputLabelProps={{
                      classes: {
                        root: classes.labelRoot,
                        focused: classes.labelFocused,
                      },
                    }}
                    value={searchText === undefined ? '' : searchText}
                    onChange={handleChangeSearch}
                  />
                  {searchText !== '' && (
                    <ClearIcon
                      className={classes.searchClearIcon}
                      onClick={() => handelClearSearch()}
                    />
                  )}
                  <Select
                    native
                    value={advancedTitle['type'] !== 'Search' ? 'any' : 'advanced'}
                    onChange={(evt) => handleChange(evt)}
                    multiple={false}
                  >
                    <option aria-label="None" value="any">
                      Any
                    </option>
                    <option value="advanced">Advanced Search</option>
                  </Select>
                </Grid>
              )}
              <IconButton className={classes.toolIconButton} onClick={() => onSetSearchMode()}>
                <SearchIcon className={classes.toolIcon} />
              </IconButton>
              <IconButton className={classes.toolIconButton}>
                <NoteAddIcon className={classes.toolIcon} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.viewContainer}>
            <ContentToolbar
              title={advancedTitle['title'] ? advancedTitle['title'] : ''}
              selectFieldList={fieldList}
              exportData={exportData}
              onError={(errorTitle: string) => openError(true, errorTitle)}
            />
            <Grid item>
              {advancedTitle['type'] !== 'Search' ? (
                <Collapse
                  in={advancedTitle['title'] && exportData.length > 0 ? true : false}
                  timeout="auto"
                  unmountOnExit
                >
                  <Grid item className={classes.advancedSearchContainer}>
                    <IconButton
                      aria-label="ArrowDown"
                      className={classes.expandLessIcon}
                      onClick={() => setAdvancedOption('')}
                    >
                      <ExpandLessIcon />
                    </IconButton>
                    <WorkspaceShareForm
                      formType={advancedTitle['type']}
                      resourceData={exportData}
                      identifier={identifier}
                      setResetLink={() => setSafely(setIdentifier, cuid.slug())}
                      closeShareForm={() => setSafely(setAdvancedOption, [])}
                      openErrorMessage={(message) => openError(true, message)}
                    />
                  </Grid>
                </Collapse>
              ) : (
                <Collapse in={advancedTitle['title'] ? true : false} timeout="auto" unmountOnExit>
                  <Grid item className={classes.advancedSearchContainer}>
                    <IconButton
                      aria-label="ArrowDown"
                      className={classes.expandLessIcon}
                      onClick={() => handleClickAdcanced()}
                    >
                      <ExpandLessIcon />
                    </IconButton>
                    <WorkspaceAdvancedSearch
                      onError={(errorTitle: string) => openError(true, errorTitle)}
                    />
                  </Grid>
                </Collapse>
              )}
            </Grid>
            {folderPath.charAt(0) !== 'w' &&
              folderPath.charAt(0) !== 'p' &&
              folderPath.charAt(0) !== 's' &&
              folderPath.charAt(0) !== 'r' && (
                <div className={classes.noRowIcon}>
                  <NoRowIcon />
                </div>
              )}
            {tableViewMode &&
              (folderPath.charAt(0) === 'w' ||
                folderPath.charAt(0) === 'p' ||
                folderPath.charAt(0) === 'r' ||
                folderPath.charAt(0) === 's') && (
                <WorkspaceTable
                  onSetItem={(listData: any, exportData: any) => onSetItem(listData, exportData)}
                />
              )}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
