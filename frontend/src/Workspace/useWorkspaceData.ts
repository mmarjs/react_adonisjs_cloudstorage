import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { StatusContext } from 'App/StatusProvider'
import {
  setSubBreadcrumb,
  setIsLoader,
  setWorkspaceUsers,
  setPersonalParentId,
  setWorkgroupParentId,
  setCaseId,
  setSelectedCaseData,
} from 'Data/Workspace'
import { setFieldNodeId } from 'Data/TableViewDataList'

/** Helpers */
import {
  FolderTreeItem,
  WorkGroupDirectoryParams,
  WorkspaceDirectory,
  WorkSpaceFolderItem,
  WorkSpaceSearchBody,
} from 'types'
import { GroupType, WorkspaceRecycleBinItem } from './types'
import { WORKSPACE_URL, useAxios, MANAGE_CASES_URL } from 'Lib'
import find from 'lodash-es/find'
import dayjs from 'dayjs'
import { WorkspaceGridContext, Store } from 'Workspace'
import { SearchTableDataItem, AdvancedSearchFilterItem, SearchFileDataItem } from './types'
import { getSearchBody } from './common'

export function useWorkspaceData() {
  const dispatch = useDispatch()
  const history = useHistory()
  const { showStatus } = useContext(StatusContext)
  const axios = useAxios()
  const first_name = useSelector((state: AppState) => state.user.first_name)
  const last_name = useSelector((state: AppState) => state.user.last_name)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const currentParentId = useSelector((state: AppState) => state.tableViewData.fieldNodeId)

  const {
    workgroupData,
    setWorkGroupData,
    personalData,
    setPersonalData,
    setWorkspaceTableData,
    workspaceTableData,
    setFolderPath,
    folderPath,
    setSearchTableData,
    searchTableData,
    setWorkspaceRecycleBinData,
    recycleBinData,
    setRecycleBinParentIds,
    groupType,
    setGroupType,
    setWorkspaceRecycleBinTableData,
    pagination,
    setPagination,
  } = useContext(WorkspaceGridContext) as Store

  const goToWorkgroupLocation = (folderId: number, folders: FolderTreeItem[]) => {
    const workspaceFolder: any = find(folders, { id: folderId })
    history.push(`${WORKSPACE_URL}/${workspaceFolder?.path}`)
  }

  const getWorkspaceFolders = (folders: FolderTreeItem[], path: string, type: GroupType) => {
    dispatch(setIsLoader(true))
    setWorkspaceTableData([])
    let parentId: number = 0
    let folderData: FolderTreeItem[] = []
    if (type === 'workgroup') {
      let t_workgroupData: FolderTreeItem[] = []
      const parentFolder: any = find(folders, { path: path })
      if (parentFolder === undefined) {
        dispatch(setIsLoader(false))
        return
      }
      parentId = parentFolder?.data_id
      folders.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        if (ele_temp.data_id === parentFolder.data_id) ele_temp.selected = true
        else ele_temp.selected = false
        if (ele_temp.data_id === parentFolder.parent_id) ele_temp.expanded = true
        t_workgroupData.push(ele_temp)
        return ele_temp
      })
      folderData = t_workgroupData
      setWorkGroupData(t_workgroupData)
    } else if (type === 'personal') {
      let t_personalData: FolderTreeItem[] = []
      const parentFolder: any = find(folders, { path: path })
      if (parentFolder === undefined) {
        dispatch(setIsLoader(false))
        return
      }
      parentId = parentFolder.id
      folders.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        if (ele_temp.data_id === parentFolder.data_id) ele_temp.selected = true
        else ele_temp.selected = false
        if (ele_temp.data_id === parentFolder.parent_id) ele_temp.expanded = true
        t_personalData.push(ele_temp)
        return ele_temp
      })
      folderData = t_personalData
      setPersonalData(t_personalData)
    }
    dispatch(setFieldNodeId(parentId))
    const directoryParam: WorkGroupDirectoryParams = {
      folderId: parentId,
      status: 'active',
    }
    const params = {
      folders: folderData,
      param: directoryParam,
      type: type,
    }
    mutationGetFolders.mutate(params)
  }

  const getFiles = async (params): Promise<any> => {
    // dispatch(setIsLoader(true))
    const childFolders = params.folders.filter(
      (item: any) => item.parent_id === params.param.folderId
    )

    const data = await axios.get(
      `${params.type === 'workgroup' ? '/workgroup/file/view/' : '/personal/file/view/'}${
        params.param.folderId
      }/${params.param.status}/${pagination?.page}/100`
    )

    setPagination({
      ...pagination,
      total: childFolders?.length + data.data?.meta.total,
    })

    const files = workspaceTableData.filter((item) => item.type === 'file')
    const childFileData = files.concat(data.data?.data)

    dispatch(setIsLoader(false))
    const selectData = {
      folders: childFolders,
      files: childFileData,
    }
    return selectData
  }

  const mutationGetFolders = useMutation(getFiles, {
    onSuccess: (data) => {
      setWorkspaceSelectData(data)
    },
  })

  const setWorkspaceSelectData = (selectData: any) => {
    let t_fileData: FolderTreeItem[] = []
    for (let file of selectData.files) {
      let fileData: FolderTreeItem = {
        id: file.id,
        access: file.access,
        data_id: file.id,
        name: file.name,
        icon: 'file',
        modifiedDate: dayjs(file.updated_at).format('YYYY-MM-DD hh:mm:ss A'),
        notes: file.notes ?? '',
        owner: first_name + ' ' + last_name,
        size: file.size,
        type: 'file',
        fileType: file.file_type_name,
        parent_id: file.work_group_folder_id ? file.work_group_folder_id : file.personal_folder_id,
        dataType: 'file',
        tooltip: file.name,
        path: file.path,
      }
      if (!file.parent_id) t_fileData.push(fileData)
      else t_fileData.push(file)
    }

    selectData.folders.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    t_fileData.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    const selectWorkspaceData = selectData.folders.concat(t_fileData)
    let t_workspaceData: FolderTreeItem[] = []
    selectWorkspaceData.map((el: FolderTreeItem, index: number) => {
      let ele_temp: any = {}
      Object.assign(ele_temp, el)
      ele_temp.id = index
      t_workspaceData.push(ele_temp)
      return el
    })

    dispatch(setIsLoader(false))
    setWorkspaceTableData(t_workspaceData)
  }

  const getRecycleBinDataByFolderId = (
    removedData: WorkspaceRecycleBinItem[],
    parent_Id: number,
    type: string
  ) => {
    setGroupType(type)
    let removeData: any = []
    if (type === 'work') {
      removeData = removeData
        .concat(removedData['workGroupData']?.folders)
        .concat(removedData['workGroupData']?.files)
    } else {
      removeData = removeData
        .concat(removedData['personalData']?.folders)
        .concat(removedData['personalData']?.files)
    }
    let removeChildData = removeData.filter(
      (item: any) =>
        item.parent_id === parent_Id ||
        item.work_group_folder_id === parent_Id ||
        item.personal_folder_id === parent_Id
    )

    let t_removedData: any = []
    removeChildData.map((ele, index) => {
      let ele_temp: any = {}
      if (ele.fileType) {
        ele_temp.fileId = ele.id
        ele_temp.id = index
        ele_temp.name = ele.name
        ele_temp.groupType = ele.work_group_folder_id ? 'work' : 'personal'
        ele_temp.location = getLocation(ele.work_group_folder_id ? 'workgroup' : 'personal', ele.id)
        ele_temp.folderId = ele.work_group_folder_id
          ? ele.work_group_folder_id
          : ele.personal_folder_id
        ele_temp.size = ele.size
        ele_temp.type = 'file'
        ele_temp.fileType = ele.fileType.name
        ele_temp.dateDeleted = dayjs(ele.last_modified).format('YYYY-MM-DD hh:mm:ss A')
        ele_temp.deletedBy = ele.owner_name
      } else {
        if (!ele.owner_name) {
          ele_temp.folderId = ele.id
          ele_temp.id = index
          ele_temp.name = ele.name
          ele_temp.groupType = 'personal'
          ele_temp.location = getLocation('personal', ele.parent_id)
          ele_temp.size = ''
          ele_temp.type = 'folder'
          ele_temp.dateDeleted = dayjs(ele.updated_at).format('YYYY-MM-DD hh:mm:ss A')
          ele_temp.deletedBy = first_name + ' ' + last_name
        } else {
          ele_temp.folderId = ele.id
          ele_temp.id = index
          ele_temp.name = ele.name
          ele_temp.groupType = 'work'
          ele_temp.location = getLocation('workgroup', ele.parent_id)
          ele_temp.size = ''
          ele_temp.type = 'folder'
          ele_temp.dateDeleted = dayjs(ele.updated_at).format('YYYY-MM-DD hh:mm:ss A')
          ele_temp.deletedBy = ele.owner_name
        }
      }
      t_removedData.push(ele_temp)
      return ele
    })
    if (t_removedData.length === 0) setRecycleBinParentIds([])
    setWorkspaceRecycleBinTableData(t_removedData)
  }

  const handleRecycleData = (folderId: number, type: string, initMode: boolean) => {
    let parentIds: number[] = []
    if (initMode) {
      if (type === 'work')
        parentIds = findParentIds(recycleBinData['workGroupData']?.folders, [], folderId)
      else parentIds = findParentIds(recycleBinData['personalData']?.folders, [], folderId)
      parentIds.pop()
      parentIds.push(0)
      parentIds.unshift(folderId)
      setRecycleBinParentIds(parentIds)
    }
    dispatch(setFieldNodeId(folderId))
    if (folderId !== 0) getRecycleBinDataByFolderId(recycleBinData, folderId, type)
    else setRecycleBinData(recycleBinData)
  }

  const recycleData = async (params): Promise<WorkspaceRecycleBinItem[]> => {
    const { data } = await axios.get(`/workspace/recycle_bin/${params.caseId}`)
    return data
  }

  const mutationRecycleData = useMutation(recycleData, {
    onSuccess: (data) => {
      setWorkspaceRecycleBinData(data)
      if (currentParentId === 0 || recycleBinData.length === 0) setRecycleBinData(data)
      else getRecycleBinDataByFolderId(data, currentParentId, groupType)
    },
    onError: () => {
      dispatch(setIsLoader(false))
    },
  })

  const getRecycleBinData = () => {
    dispatch(setIsLoader(true))
    const params = {
      caseId: currentCaseId,
    }
    mutationRecycleData.mutate(params)
  }

  const setRecycleBinData = (removedData: WorkspaceRecycleBinItem[]) => {
    let personalData: any = []
    let workGroupData: any = []
    personalData = personalData
      .concat(removedData['personalData']?.folders)
      .concat(removedData['personalData']?.activeFolderFiles)
    workGroupData = workGroupData
      .concat(removedData['workGroupData']?.folders)
      .concat(removedData['workGroupData']?.activeFolderFiles)
    const removedWorkspaceData = workGroupData.concat(personalData)

    let t_removedData: any = []
    const workgroupItemIds = removedData['workGroupData']?.folders.map((p) => p.id)
    const personalItemIds = removedData['personalData']?.folders.map((p) => p.id)
    removedWorkspaceData.map((ele, index) => {
      let ele_temp: any = {}
      if (ele?.file_type_name) {
        // if (ele.work_group_folder_id && workgroupItemIds.includes(ele.work_group_folder_id))
        //   return ele
        // if (!ele.work_group_folder_id && personalItemIds.includes(ele.personal_folder_id))
        //   return ele
        ele_temp.fileId = ele.id
        ele_temp.id = index
        ele_temp.name = ele.name
        ele_temp.groupType = ele.work_group_folder_id ? 'work' : 'personal'
        ele_temp.location = getLocation(
          ele.work_group_folder_id ? 'workgroup' : 'personal',
          ele.work_group_folder_id ?? ele.personal_folder_id
        )
        ele_temp.folderId = ele.work_group_folder_id
          ? ele.work_group_folder_id
          : ele.personal_folder_id
        ele_temp.size = ele.size
        ele_temp.type = 'file'
        ele_temp.fileType = ele.file_type_name
        ele_temp.dateDeleted = dayjs(ele.last_modified).format('YYYY-MM-DD hh:mm:ss A')
        ele_temp.deletedBy = ele.owner_name
        ele_temp.notes = ele.notes
        ele_temp.access = ele.access
      } else {
        if (ele.owner_name && workgroupItemIds.includes(ele.parent_id)) return ele
        if (!ele.owner_name && personalItemIds.includes(ele.parent_id)) return ele
        if (!ele.owner_name) {
          ele_temp.folderId = ele.id
          ele_temp.id = index
          ele_temp.name = ele.name
          ele_temp.groupType = 'personal'
          ele_temp.location = getLocation('personal', ele.parent_id)
          ele_temp.size = ''
          ele_temp.type = 'folder'
          ele_temp.dateDeleted = dayjs(ele.updated_at).format('YYYY-MM-DD hh:mm:ss A')
          ele_temp.deletedBy = first_name + ' ' + last_name
          ele_temp.notes = ele.notes
          ele_temp.access = ele.access
        } else {
          ele_temp.folderId = ele.id
          ele_temp.id = index
          ele_temp.name = ele.name
          ele_temp.groupType = 'work'
          ele_temp.location = getLocation('workgroup', ele.parent_id)
          ele_temp.size = ''
          ele_temp.type = 'folder'
          ele_temp.dateDeleted = dayjs(ele.updated_at).format('YYYY-MM-DD hh:mm:ss A')
          ele_temp.deletedBy = ele.owner_name
          ele_temp.notes = ele.notes
          ele_temp.access = ele.access
        }
      }
      t_removedData.push(ele_temp)
      return ele
    })

    if (t_removedData.length === 0) setRecycleBinParentIds([])
    dispatch(setIsLoader(false))
    setWorkspaceRecycleBinTableData(t_removedData)
  }

  const findParentIds = (nodeData: any, parentIds: number[], id: number) => {
    let ele_parent = nodeData.find((item: any) => item.id === id)
    if (ele_parent?.id) {
      parentIds.push(ele_parent?.parent_id)
      const parents = findParentIds(nodeData, parentIds, ele_parent.parent_id)
      return parents
    } else {
      return parentIds
    }
  }

  const findParents = (nodeData: FolderTreeItem[], parentFolders: FolderTreeItem[], id: number) => {
    let ele_tree = nodeData.find((item: FolderTreeItem) => item.id === id)
    if (ele_tree?.id) {
      parentFolders.push(ele_tree)
      const parents = findParents(nodeData, parentFolders, ele_tree.parent_id ?? 0)
      return parents
    } else {
      return parentFolders
    }
  }

  const getParentFolders = (parent_Id: number) => {
    let parentFolders = findParents(
      folderPath.charAt(0) === 'w' ? workgroupData : personalData,
      [],
      parent_Id
    )
    const parents = parentFolders.reverse()
    parents.shift()
    dispatch(setSubBreadcrumb(parents))
  }

  const getLocation = (groupType: GroupType, parent_Id: number) => {
    const parentFolders = findParents(
      groupType === 'workgroup' ? workgroupData : personalData,
      [],
      parent_Id
    )
    const parents = parentFolders.reverse()
    parents.shift()
    let location: string = ''
    if (groupType === 'personal') location += 'Personal'
    else location += 'WorkGroup'
    parents?.map((ele: FolderTreeItem, index: number) => {
      location += '/' + ele.name
      return ele
    })
    return location
  }

  const getFolderDataByPath = (path: string) => {
    setFolderPath(path)
    if (workgroupData.length === 0) {
      if (path.charAt(0) === 'w') {
        getWorkspaceFolderStructure(path, 'workgroup')
      } else if (path.charAt(0) === 'p') {
        getWorkspaceFolderStructure(path, 'personal')
      } else if (path.charAt(0) === 'r') {
        getRecycleBinData()
      }
    } else {
      if (path.charAt(0) === 'w') {
        getWorkspaceFolders(workgroupData, path, 'workgroup')
      } else if (path.charAt(0) === 'p') {
        getWorkspaceFolders(personalData, path, 'personal')
      } else if (path.charAt(0) === 'r') {
        getRecycleBinData()
      }
    }
  }

  const getWorkspaceWholeFolders = async (params): Promise<any> => {
    const { data } = await axios.get(`/workspace/directory/${params.caseId}`)
    const returnData = {
      folders: data,
      path: params.path,
      groupType: params.groupType,
    }
    return returnData
  }

  const mutationGetWorkspaceWholeFolders = useMutation(getWorkspaceWholeFolders, {
    onSuccess: (data) => {
      setInitialTreeData(data.folders, data.path, data.groupType)
    },
  })

  const getWorkspaceFolderStructure = (path: string, type: GroupType) => {
    dispatch(setIsLoader(true))
    if (path.charAt(0) === 'w') {
      const pathArray = path.split('/')
      const caseId: number = Number(pathArray[1])
      checkArchivedCase(caseId).then((isArchived) => {
        if (!isArchived) {
          if (!currentCaseId) dispatch(setCaseId(caseId))
          setWorkspaceTableData([])
          const params = {
            caseId: caseId,
            path: path,
            groupType: type,
          }
          mutationGetWorkspaceWholeFolders.mutate(params)
        }
      })
    } else {
      if (!currentCaseId) {
        showStatus('Please select case.', 'error')
        history.push(MANAGE_CASES_URL)
      }
      setWorkspaceTableData([])
      const params = {
        caseId: currentCaseId,
        path: path,
        groupType: type,
      }
      mutationGetWorkspaceWholeFolders.mutate(params)
    }
  }

  const checkArchivedCase = async (caseId: number): Promise<boolean | undefined> => {
    try {
      const { data } = await axios.get(`/cases/${caseId}/show`)
      if (data?.caseInstance?.status !== 'active') {
        showStatus(
          'This account is archived! Please activate it to get access to the workspace',
          'error'
        )
        history.push(MANAGE_CASES_URL)
        return true
      } else {
        dispatch(setSelectedCaseData(data.caseInstance))
        return false
      }
    } catch (err) {
      history.push(MANAGE_CASES_URL)
    }
  }

  const setInitialTreeData = (initialData: WorkspaceDirectory, path: string, type: GroupType) => {
    let workgroupInitData: WorkSpaceFolderItem[] = initialData.workGroupData
    let personalInitData: WorkSpaceFolderItem[] = initialData.personalData
    let workGroupFolders: FolderTreeItem[] = []
    for (let folder of workgroupInitData) {
      const workgroupFolder: any = find(workgroupData, { id: folder.id })
      let folderData: FolderTreeItem = {
        id: folder.id,
        access: folder.access,
        data_id: folder.id,
        name: folder.name,
        modifiedDate: dayjs(folder.updated_at).format('YYYY-MM-DD hh:mm:ss A'),
        notes: folder.notes ?? '',
        owner: first_name + ' ' + last_name,
        size: 0,
        type: 'folder',
        icon: 'folder',
        parent_id: folder.parent_id !== 0 ? folder.parent_id : undefined,
        tooltip: folder.name,
        expanded: folder.parent_id === 0 ? true : workgroupFolder?.expanded ?? false,
        hasChild: hasChild(workgroupInitData, folder.id),
        selected: workgroupFolder?.selected ?? false,
        path: folder.path,
      }
      workGroupFolders.push(folderData)
    }
    let personalFolders: FolderTreeItem[] = []
    for (let folder of personalInitData) {
      const personalFolder: any = find(personalData, { id: folder.id })
      let folderData: FolderTreeItem = {
        id: folder.id,
        access: folder.access,
        data_id: folder.id,
        name: folder.name,
        icon: 'folder',
        modifiedDate: dayjs(folder.updated_at).format('YYYY-MM-DD hh:mm:ss A'),
        notes: folder.notes ?? '',
        owner: first_name + ' ' + last_name,
        size: 0,
        type: 'folder',
        parent_id: folder.parent_id !== 0 ? folder.parent_id : undefined,
        tooltip: folder.name,
        expanded: folder.parent_id === 0 ? true : personalFolder?.expanded ?? false,
        hasChild: hasChild(personalInitData, folder.id),
        selected: personalFolder?.selected ?? false,
        path: folder.path,
      }
      personalFolders.push(folderData)
    }
    workGroupFolders.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    personalFolders.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    setWorkGroupData(workGroupFolders)
    setPersonalData(personalFolders)
    dispatch(setWorkspaceUsers(initialData.users))
    dispatch(setPersonalParentId(personalFolders[0]?.data_id))
    dispatch(setWorkgroupParentId(workGroupFolders[0]?.data_id))
    if (type === 'workgroup') {
      getWorkspaceFolders(workGroupFolders, path, 'workgroup')
    } else {
      getWorkspaceFolders(personalFolders, path, 'personal')
    }
  }

  const hasChild = (workgroupData: WorkSpaceFolderItem[], parentId: number) => {
    let childrens = workgroupData.filter((item: any) => item.parent_id === parentId)
    return childrens.length > 0 ? true : false
  }

  const initWorkspaceFolderData = (type: GroupType) => {
    if (type === 'workgroup') {
      let t_workgroupData: FolderTreeItem[] = []
      workgroupData.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        ele_temp.selected = false
        if (index !== 0) ele_temp.expanded = false
        else ele_temp.expanded = true

        t_workgroupData.push(ele_temp)
        return ele_temp
      })
      setWorkGroupData(t_workgroupData)
    } else if (type === 'personal') {
      let t_personalData: FolderTreeItem[] = []
      personalData.map((ele: FolderTreeItem, index: number) => {
        let ele_temp: any = {}
        Object.assign(ele_temp, ele)
        ele_temp.selected = false
        if (index !== 0) ele_temp.expanded = false
        else ele_temp.expanded = true
        t_personalData.push(ele_temp)
        return ele_temp
      })
      setPersonalData(t_personalData)
    }
  }
  //search functions
  const searchData = async (params: any): Promise<any> => {
    dispatch(setIsLoader(true))
    let data: any = []
    data = await axios.post('/workspace/search ', params)
    return data
  }

  const mutation = useMutation(searchData, {
    onSuccess: (data) => {
      let fileData: SearchFileDataItem[] = data.data?.data
      let temp_detail: SearchTableDataItem[] = []
      const searchDataLength = searchTableData.length
      if (folderPath.charAt(0) === 'w') {
        fileData?.map((ele: SearchFileDataItem, index: number) => {
          const temp_ele: SearchTableDataItem = {
            access: ele.access,
            icon: 'file',
            id: searchDataLength + index,
            modifiedDate: ele.updated_at,
            name: ele.name,
            notes: ele.notes ? ele.notes : '',
            owner: ele.owner_name,
            parent: ele.work_group_folder_id,
            size: ele.size,
            type: 'file',
            fileType: ele.fileType.name,
            folder: ele.folder.name,
            parent_Id: ele.work_group_folder_id,
            groupType: 'work',
            data_id: ele.id,
          }
          temp_detail.push(temp_ele)
          return ele
        })
      } else if (folderPath.charAt(0) === 'p') {
        fileData?.map((ele: SearchFileDataItem, index: number) => {
          const temp_ele: SearchTableDataItem = {
            access: ele.access,
            icon: 'file',
            id: searchDataLength + index,
            modifiedDate: ele.updated_at,
            name: ele.name,
            notes: ele.notes ? ele.notes : '',
            owner: first_name + ' ' + last_name,
            parent: ele.work_group_folder_id,
            size: ele.size,
            type: 'file',
            fileType: ele.fileType.name,
            folder: ele.folder.name,
            parent_Id: ele.personal_folder_id,
            groupType: 'personal',
            data_id: ele.id,
          }
          temp_detail.push(temp_ele)
          return ele
        })
      }
      const t_searchData = searchTableData.concat(temp_detail)
      setSearchTableData(t_searchData)
      dispatch(setIsLoader(false))
    },
    onError: () => {},
  })

  const onGetSimpleSearch = (
    serchText: string,
    folder_Id: number,
    category_id: number,
    category: 'workgroup' | 'personal' | 'evidence' | 'shared' = 'workgroup',
    page: number,
    limit: number
  ) => {
    const searchBody: WorkSpaceSearchBody = {
      search_type: 'simple',
      filename: serchText,
      folder_id: folder_Id,
      status: 'active',
      category: category,
      category_id: category_id,
      page: page,
      limit: limit,
    }
    let params: any = []
    params = searchBody
    mutation.mutate(params)
  }

  const onGetAdvancedSearch = (
    data: AdvancedSearchFilterItem,
    folder_Id: number,
    category_id: number,
    page: number,
    limit: number
  ) => {
    const searchBody: WorkSpaceSearchBody = getSearchBody(data, folder_Id, category_id, page, limit)
    mutation.mutate(searchBody)
  }

  const clearPagination = () => {
    setPagination({
      ...pagination,
      current_page: 1,
      pages: [],
      page: 1,
      total: 0,
    })
    setWorkspaceTableData([])
  }

  return {
    getWorkspaceFolders,
    goToWorkgroupLocation,
    getRecycleBinData,
    getParentFolders,
    getFolderDataByPath,
    getWorkspaceFolderStructure,
    initWorkspaceFolderData,
    onGetSimpleSearch,
    onGetAdvancedSearch,
    mutation,
    getRecycleBinDataByFolderId,
    handleRecycleData,
    clearPagination,
  }
}
