import { useState, useContext } from 'react'

/** Data */
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { StatusContext } from 'App/StatusProvider'
import { useWorkspaceData } from './useWorkspaceData'
import { WorkspaceGridContext, Store } from 'Workspace'
import { AppState } from 'App/reducers'
import {
  setCurrentFileName,
  setCurrentFileIdByContext,
  setContextFileType,
  setPendingNotification,
  setSearchFlag,
} from 'Data/Workspace'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** UI */
import { WorkspaceRenameForm } from './WorkspaceRenameForm'
import { enableRipple } from '@syncfusion/ej2-base'
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations'
import IconTreeFolder from '../Image/icon_tree_folder.svg'
import { ContextMenu } from './ContextMenu'

/** Helpers */
import 'lodash'
import deepdash from 'deepdash'
import { ContextMenuItem } from './types'
import clsx from 'clsx'
import { useAxios, useFileDownload } from 'Lib'
import {
  Folder,
  CreateWorkGroupFolderBody,
  UpdateWorkGroupFolderStatusBody,
  RenameWorkGroupFolderBody,
  RenamePersonalFolderBody,
  UpdatePersonalFolderStatusBody,
  CreatePersonalFolderBody,
  UpdateWorkGroupFileStatusBody,
  UpdatePersonalFileStatusBody,
  RenameWorkGroupFileBody,
  RenamePersonalFileBody,
  FolderTreeItem,
} from 'types'

enableRipple(true)
declare var _: any
deepdash(_)

const useStyles = makeStyles((theme) => ({
  root: {
    '& .react-contextmenu': {
      backgroundColor: '#fff',
      backgroundClip: 'padding-box',
      border: '1px solid rgba(0,0,0,.15)',
      borderRadius: '.25rem',
      color: '#373a3c',
      fontSize: '16px',
      margin: '2px 0 0',
      minWidth: '160px',
      opacity: 0,
      padding: '5px, 0',
      pointerEvents: 'none',
      textAlign: 'left',
      transition: 'opacity 250ms ease !important',
    },
    '& .react-contextmenu.react-contextmenu--visible': {
      opacity: -1,
      pointerEvents: 'auto',
      zIndex: 9999,
    },
    '& .react-contextmenu-item': {
      background: '0 0',
      border: 0,
      color: '#373a3c',
      cursor: 'pointer',
      fontWeight: 400,
      lineHeight: 1.5,
      padding: '3px 20px',
      textAlign: 'inherit',
      whiteSpace: 'nowrap',
    },
    '& .react-contextmenu-item--active, .react-contextmenu-item--selected': {
      color: '#fff',
      backgroundColor: '#20a0ff',
      borderColor: '#20a0ff',
      textDecoration: 'none',
    },
    '& .react-contextmenu-item--disabled': {
      backgroundColor: 'transparent',
      borderColor: 'rgba(0,0,0,.15)',
      color: '#878a8c',
    },
  },
  hideRoot: {
    display: 'none',
  },
  treeContainer: {
    'marginLeft': '30px',
    'width': '100%',
    '& .e-list-parent': {
      overflow: 'hidden',
    },
    '& .e-treeview': {
      marginLeft: '7px',
    },
    '& .e-level-1>': {
      display: 'none',
    },
    '& .e-treeview .e-list-item.e-active > .e-fullrow': {
      backgroundColor: '#ffffff',
      borderColor: '#ffffff',
    },
    '& .e-treeview .e-list-item.e-active > .e-text-content .e-list-text': {
      color: '#5fb158',
    },
    '& .e-treeview .e-list-icon': {
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url(${IconTreeFolder})`,
      height: '20px',
    },
    '& .e-treeview .e-list-item': {
      padding: 0,
    },
    '& .e-treeview.e-fullrow-wrap .e-text-content': {
      // height: '25px',
    },
    '& .e-treeview .e-ul': {
      padding: '0px 0px 8px 10px',
    },
  },
  nodeContainer: {
    position: 'relative',
    display: 'flex',
    zIndex: +1,
    paddingBottom: '4px',
  },
  nodeItem: {
    'paddingLeft': '4px',
    'width': '100%',
    'fontSize': '1rem',
    'textOverflow': 'ellipsis',
    'overflow': 'hidden',
    'whiteSpace': 'nowrap',
    '&:hover': {
      color: '#5fb158',
    },
  },
  folderIcon: {
    marginRight: '5px',
    marginBottom: '-4px',
    color: '#5fb158',
    fontSize: '20px',
  },
  titleellipsis: {
    paddingTop: '5px',
  },
}))

export function WorkspaceTree() {
  const classes = useStyles()
  const {
    goToWorkgroupLocation,
    getParentFolders,
    getWorkspaceFolderStructure,
    clearPagination,
  } = useWorkspaceData()
  const dispatch = useDispatch()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const [isAddFolder, setIsAddFolder] = useState<boolean>(false)
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false)
  const [subFolderData, setSubFolderData] = useState<any>([])
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const currentFileName = useSelector((state: AppState) => state.workspaceData.currentFileName)
  const currentFileIdByContext = useSelector(
    (state: AppState) => state.workspaceData.currentFileIdByContext
  )
  const collapseOption = useSelector((state: AppState) => state.workspaceData.collapseOption)
  const contextFileType = useSelector((state: AppState) => state.workspaceData.contextFileType)
  const userId = useSelector((state: AppState) => state.user.id)
  const { onFileDownload } = useFileDownload(collapseOption)

  const {
    workgroupData,
    personalData,
    setWorkGroupData,
    setPersonalData,
    folderPath,
    setSearchMode,
    setSearchText,
  } = useContext(WorkspaceGridContext) as Store

  let contextMenuItem: ContextMenuItem[] = [
    { text: 'Rename' },
    { text: 'Delete' },
    { text: 'New Folder' },
    { text: 'Download' },
  ]

  const addFolder = async (params: object): Promise<Folder> => {
    let pending: any = {
      isPending: true,
      pendingText: 'Creating',
      isDone: false,
    }
    dispatch(setPendingNotification(pending))
    let data: any = []
    if (folderPath.charAt(0) === 'w') {
      data = await axios.post('/workgroup/folder/create  ', params)
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.post('/personal/folder/create', params)
    }
    return data
  }

  const mutationNewFolder = useMutation(addFolder, {
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
      removeState()
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Creating',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A new folder could not be added, please try again', 'error')
      removeState()
    },
  })

  const onAddNewFolder = (newName: string) => {
    clearPagination()
    setRenameModalOpen(false)
    if (folderPath.charAt(0) === 'w') {
      const params: CreateWorkGroupFolderBody = {
        caseId: currentCaseId,
        parentId: currentFileIdByContext,
        name: newName,
      }
      mutationNewFolder.mutate(params)
    } else if (folderPath.charAt(0) === 'p') {
      const params: CreatePersonalFolderBody = {
        userId: userId,
        parentId: currentFileIdByContext,
        name: newName,
      }
      mutationNewFolder.mutate(params)
    }
  }

  const deleteFolderById = async (params: object): Promise<Folder> => {
    let pending: any = {
      isPending: true,
      pendingText: 'Deleting',
      isDone: false,
    }
    dispatch(setPendingNotification(pending))
    let data: any = []
    if (folderPath.charAt(0) === 'w') {
      data = await axios.put('/workgroup/folder/update', params)
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.put('/personal/folder/update', params)
    }
    return data
  }

  const mutationDeleteFolder = useMutation(deleteFolderById, {
    onSuccess: (data) => {
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
      showStatus('A folder was successfully deleted!')
      removeState()
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A folder could not be deleted, please try again', 'error')
      removeState()
    },
  })

  const deleteFolder = () => {
    clearPagination()
    if (folderPath.charAt(0) === 'w') {
      const params: UpdateWorkGroupFolderStatusBody = {
        caseId: currentCaseId,
        folderId: currentFileIdByContext,
        status: 'trashed',
      }
      mutationDeleteFolder.mutate(params)
    } else if (folderPath.charAt(0) === 'p') {
      const params: UpdatePersonalFolderStatusBody = {
        userId: userId,
        folderId: currentFileIdByContext,
        status: 'trashed',
      }
      mutationDeleteFolder.mutate(params)
    }
  }

  const deleteFileById = async (params: object): Promise<Folder> => {
    let pending: any = {
      isPending: true,
      pendingText: 'Deleting',
      isDone: false,
    }
    dispatch(setPendingNotification(pending))
    let data: any = []
    if (folderPath.charAt(0) === 'w') {
      data = await axios.put('/workgroup/file/update', params)
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.put('/personal/file/update', params)
    }
    return data
  }

  const mutationDeleteFile = useMutation(deleteFileById, {
    onSuccess: (data) => {
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
      showStatus('A file was successfully deleted!')
      removeState()
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Deleting',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A file could not be deleted, please try again', 'error')
      removeState()
    },
  })

  const deleteFile = () => {
    clearPagination()
    if (folderPath.charAt(0) === 'w') {
      const params: UpdateWorkGroupFileStatusBody = {
        caseId: currentCaseId,
        fileIds: [currentFileIdByContext],
        status: 'trashed',
      }
      mutationDeleteFile.mutate(params)
    } else if (folderPath.charAt(0) === 'p') {
      const params: UpdatePersonalFileStatusBody = {
        userId: userId,
        fileIds: [currentFileIdByContext],
        status: 'trashed',
      }
      mutationDeleteFile.mutate(params)
    }
  }

  const renameFolderById = async (params: object): Promise<Folder> => {
    let pending: any = {
      isPending: true,
      pendingText: 'Renaming',
      isDone: false,
    }
    dispatch(setPendingNotification(pending))
    let data: any = []
    if (folderPath.charAt(0) === 'w') {
      data = await axios.post('/workgroup/folder/rename', params)
    } else if (folderPath.charAt(0) === 'p') {
      data = await axios.post('/personal/folder/rename', params)
    }
    return data
  }

  const mutationRenameFolder = useMutation(renameFolderById, {
    onSuccess: (data) => {
      getWorkspaceFolderStructure(
        folderPath,
        folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
      )
      let pending: any = {
        isPending: false,
        pendingText: 'Renaming',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A folder was successfully renamed!')
      removeState()
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Renaming',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A folder could not be renamed, please try again', 'error')
      removeState()
    },
  })

  const renameFolder = (newName: string) => {
    clearPagination()
    setRenameModalOpen(false)
    dispatch(setCurrentFileName(''))
    if (folderPath.charAt(0) === 'w') {
      if (contextFileType === 'folder') {
        const params: RenameWorkGroupFolderBody = {
          caseId: currentCaseId,
          folderId: currentFileIdByContext,
          name: newName,
        }
        mutationRenameFolder.mutate(params)
      } else {
        const params: RenameWorkGroupFileBody = {
          caseId: currentCaseId,
          fileId: currentFileIdByContext,
          name: newName,
        }
        mutationRenameFile.mutate(params)
      }
    } else if (folderPath.charAt(0) === 'p') {
      if (contextFileType === 'folder') {
        const params: RenamePersonalFolderBody = {
          userId: userId,
          folderId: currentFileIdByContext,
          name: newName,
        }
        mutationRenameFolder.mutate(params)
      } else {
        const params: RenamePersonalFileBody = {
          userId: userId,
          fileId: currentFileIdByContext,
          name: newName,
        }
        mutationRenameFile.mutate(params)
      }
    }
  }

  const renameFileById = async (params: object): Promise<Folder> => {
    let pending: any = {
      isPending: true,
      pendingText: 'Renaming',
      isDone: false,
    }
    dispatch(setPendingNotification(pending))
    let data: any = []
    if (folderPath.charAt(0) === 'w') {
      data = await axios.post('/workgroup/file/rename', params)
    } else if (collapseOption.personal) {
      data = await axios.post('/personal/file/rename', params)
    }
    return data
  }

  const mutationRenameFile = useMutation(renameFileById, {
    onSuccess: (data) => {
      getWorkspaceFolderStructure(
        folderPath,
        folderPath.charAt(0) === 'w' ? 'workgroup' : 'personal'
      )
      let pending: any = {
        isPending: false,
        pendingText: 'Renaming',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A file was successfully renamed!')
      removeState()
    },
    onError: () => {
      let pending: any = {
        isPending: false,
        pendingText: 'Renaming',
        isDone: false,
      }
      dispatch(setPendingNotification(pending))
      showStatus('A file could not be renamed, please try again', 'error')
      removeState()
    },
  })

  const downloadFile = () => {
    const params = [{ data_id: currentFileIdByContext, type: 'file' }]
    onFileDownload(params)
  }

  let fields: any = {}

  if (collapseOption.workgroup) {
    fields = {
      dataSource: workgroupData,
      id: 'data_id',
      parentID: 'parent_id',
      text: 'name',
      hasChildren: 'hasChild',
      iconCss: 'icon',
      selected: 'selected',
    }
  } else if (collapseOption.personal) {
    fields = {
      dataSource: personalData,
      id: 'data_id',
      parentID: 'parent_id',
      text: 'name',
      hasChildren: 'hasChild',
      iconCss: 'icon',
      selected: 'selected',
    }
  }

  const nodeclicked = (arg: any) => {
    let value: string = arg.node.getAttribute('data-uid')
    dispatch(setCurrentFileIdByContext(Number(value)))
    dispatch(setContextFileType('folder'))
    if (arg.event.button === 2) {
      if (folderPath.charAt(0) === 'w') {
        let folder_data = workgroupData.find((item: any) => item.id === Number(value))
        let subFolderData = workgroupData.filter((item: any) => item.parent_id === Number(value))
        setSubFolderData(subFolderData)
        if (folder_data) dispatch(setCurrentFileName(folder_data.name))
      } else if (folderPath.charAt(0) === 'p') {
        let folder_data = personalData.find((item: any) => item.id === Number(value))
        let subFolderData = personalData.filter((item: any) => item.parent_id === Number(value))
        setSubFolderData(subFolderData)
        if (folder_data) dispatch(setCurrentFileName(folder_data.name))
      }
    }
  }

  const nodeSelected = (arg: any) => {
    const value: number = Number(arg.nodeData['id'])
    clearPagination()
    if (folderPath.charAt(0) === 'w') {
      goToWorkgroupLocation(value, workgroupData)
    } else {
      goToWorkgroupLocation(value, personalData)
    }
    getParentFolders(value)
    setSearchMode(false)
    dispatch(setSearchFlag(false))
    setSearchText('')
  }

  const nodeCollapsed = (arg: any) => {
    let folderId = arg.nodeData.id
    if (folderPath.charAt(0) === 'w') {
      let t_workgroupData: FolderTreeItem[] = []
      workgroupData.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        if (ele_temp.data_id === Number(folderId)) {
          ele_temp.expanded = false
        }
        t_workgroupData.push(ele_temp)
        return ele_temp
      })
      setWorkGroupData(t_workgroupData)
    } else if (folderPath.charAt(0) === 'p') {
      let t_personalData: FolderTreeItem[] = []
      personalData.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        if (ele_temp.data_id === Number(folderId)) {
          ele_temp.expanded = false
        }
        t_personalData.push(ele_temp)
        return ele_temp
      })
      setPersonalData(t_personalData)
    }
  }

  const nodeExpanded = (arg: any) => {
    let folderId = arg.nodeData.id
    if (folderPath.charAt(0) === 'w') {
      let t_workgroupData: FolderTreeItem[] = []
      workgroupData.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        if (ele_temp.data_id === Number(folderId)) {
          ele_temp.expanded = true
        }
        t_workgroupData.push(ele_temp)
        return ele_temp
      })
      setWorkGroupData(t_workgroupData)
    } else if (folderPath.charAt(0) === 'p') {
      let t_personalData: FolderTreeItem[] = []
      personalData.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        if (ele_temp.data_id === Number(folderId)) {
          ele_temp.expanded = true
        }
        t_personalData.push(ele_temp)
        return ele_temp
      })
      setPersonalData(t_personalData)
    }
  }

  const menuclick = (arg: any) => {
    if (arg.item.text === 'Rename') {
      setRenameModalOpen(true)
    } else if (arg.item.text === 'Delete') {
      if (contextFileType === 'folder') {
        deleteFolder()
      } else {
        deleteFile()
      }
    } else if (arg.item.text === 'New Folder') {
      setIsAddFolder(true)
      setRenameModalOpen(true)
    } else if (arg.item.text === 'Download') {
      downloadFile()
    }
  }

  const removeState = () => {
    setIsAddFolder(false)
    setRenameModalOpen(false)
  }

  return (
    <Grid
      container
      className={clsx({
        [classes.root]: collapseOption.workgroup || collapseOption.personal,
        [classes.hideRoot]: !collapseOption.workgroup && !collapseOption.personal,
      })}
    >
      <Grid id="tree" item className={classes.treeContainer}>
        <TreeViewComponent
          fields={fields}
          allowDragAndDrop={true}
          nodeClicked={nodeclicked}
          nodeCollapsed={nodeCollapsed}
          nodeExpanded={nodeExpanded}
          nodeSelected={nodeSelected}
        />
        {(folderPath.charAt(0) === 'w' || folderPath.charAt(0) === 'p') && (
          <ContextMenu
            anchor={'#tree'}
            contextMenuItem={contextMenuItem}
            onChangeMenu={(arg: any) => menuclick(arg)}
          />
        )}
      </Grid>
      <WorkspaceRenameForm
        onSetCreateName={(newName: string) => onAddNewFolder(newName)}
        onSetRenameName={(newName: string) => renameFolder(newName)}
        open={renameModalOpen}
        onCloseModal={() => removeState()}
        isAddFolder={isAddFolder}
        currentName={!isAddFolder ? currentFileName : ''}
        subDataList={subFolderData}
      />
    </Grid>
  )
}
