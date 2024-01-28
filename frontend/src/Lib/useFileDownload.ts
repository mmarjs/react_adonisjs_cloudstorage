import { useContext } from 'react'

/** Data */
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { useMutation } from 'react-query'
import { StatusContext } from 'App/StatusProvider'

/** Helpers */
import Axios, { AxiosResponse, AxiosError } from 'axios'
import useAuthToken from 'Auth/useAuthToken'
import { BuildZipFileParams, ExportFile, ExportFolder } from 'Workspace/types'
import { WorkspaceCollapseOption, DownloadCategory } from 'types'

interface SingleFileParams {
  resource: string
  id: number
  shareLinkId?: number
}

interface SingleFileResponse {
  url: string
  filename: string
}
interface BuildZipResponse {
  success: {
    link: string
  }
}

function singleDownloadErrorMessage(string): string {
  const errors = new Map<string, string>()
  errors.set('not-authorized-to-download', 'You are not authorized to download these files.')
  errors.set('invalid-folder-id', 'There was a problem fetching the file data. Please try again.')

  return errors.get(string) ?? 'The file download failed to start. Please try again.'
}

function buildZipErrorMessage(string): string {
  const errors = new Map<string, string>()
  errors.set('not-authorized-to-download', 'You are not authorized to download these files.')
  errors.set('too-big', 'The total size exceeds the limit of 100GB. Please select fewer files.')
  errors.set(
    'failed-to-build-zip',
    'There was an error in building the zip file. Please try again.'
  )

  return errors.get(string) ?? 'The zip download failed to start. Please try again.'
}

export function useFileDownload(option: WorkspaceCollapseOption) {
  const token = useAuthToken()
  const { showStatus } = useContext(StatusContext)
  const userId = useSelector((state: AppState) => state.user.id)
  const caseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const shareLink = useSelector((state: AppState) => state.share.shareLink)
  const shareFiles = useSelector((state: AppState) => state.share.files)
  const resource = findResourceCategory(option)

  function findResourceCategory(option: WorkspaceCollapseOption): DownloadCategory {
    if (option.personal) {
      return 'personal'
    }

    if (option.share) {
      if (shareLink.resource === 'work_group') {
        return 'workgroup'
      }
      if (shareLink.resource === 'personal') {
        return 'personal'
      }
    }

    return 'workgroup'
  }

  const getSingleFile = async (params: SingleFileParams): Promise<SingleFileResponse> => {
    const axios = Axios.create({
      headers: { token: token.token },
      baseURL: process.env.REACT_APP_API,
    })

    const res: AxiosResponse = await axios.post(`/files/download_file`, params)
    return res.data
  }

  const processGetSingleFile = useMutation(getSingleFile, {
    onSuccess: (data) => {
      startSingleDownload(data.url, data.filename)
    },
    onError: (err: AxiosError) => {
      const message = err.response?.data as { error: string }
      showError(singleDownloadErrorMessage(message?.error))
    },
  })

  const buildZipFile = async (params: BuildZipFileParams): Promise<BuildZipResponse> => {
    const axios = Axios.create({
      headers: { token: token.token },
      baseURL: process.env.REACT_APP_API,
    })
    const res: AxiosResponse = await axios.post('/files/build_zip', params)
    return res.data
  }

  const processBuildZipFile = useMutation(buildZipFile, {
    onSuccess: (data) => {
      startZipDownload(data.success.link)
    },
    onError: (err: AxiosError) => {
      const message = err.response?.data as { error: string }
      showError(buildZipErrorMessage(message.error))
    },
  })

  function startSingleDownload(url: string, fileName: string) {
    var a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', fileName)
    a.click()
  }

  function startZipDownload(url: string, fileName?: string) {
    var a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', fileName ?? 'export.zip')
    a.click()
  }

  function showError(message: string) {
    showStatus(message, 'error')
  }

  function parseFolders(data: any): ExportFolder[] {
    return data
      .filter((s: any) => s.type === 'folder')
      .map((f: any) => {
        return {
          id: f?.data_id,
          parent_id: f?.parent_id,
        }
      })
  }

  function parseFiles(data: any): ExportFile[] {
    const parentId = getParentId([], [])
    return data
      .filter((s: any) => s.type === 'file')
      .map((f: any) => {
        if (option.share) {
          return {
            id: f['data_id'],
            parent_id: parentId,
          }
        } else {
          return {
            id: f['data_id'],
            parent_id: f?.parent_id,
          }
        }
      })
  }

  function isZipDownload(folders: ExportFile[], files: ExportFile[]): boolean {
    return folders.length > 0 || files.length > 1
  }

  function makeSingleFileParams(files: ExportFile[], shareLinkId?: number): SingleFileParams {
    return {
      resource: resource,
      id: files[0]?.id,
      shareLinkId: shareLinkId,
    }
  }

  function getParentId(folders: ExportFile[], files: ExportFile[]) {
    if (option.share) {
      if (resource === 'workgroup') {
        return shareFiles[0].work_group_folder_id
      }

      if (resource === 'personal') {
        return shareFiles[0].personal_folder_id
      }
    } else {
      if (folders.length > 0) {
        return folders[0]?.parent_id
      }

      return files[0]?.parent_id
    }
  }

  function getResourceId() {
    if (resource === 'personal') {
      return userId
    }

    return caseId
  }

  function makeZipParams(
    folders: ExportFile[],
    files: ExportFile[],
    shareLinkId?: number
  ): BuildZipFileParams {
    const parentId = getParentId(folders, files)
    const resourceId = getResourceId()

    return {
      resource: resource,
      resourceId: resourceId,
      parentId: parentId,
      files: files.map((f) => f.id),
      folders: folders.map((f) => f.id),
      shareLinkId: shareLinkId,
    }
  }

  function onFileDownload(data: any, shareLinkId?: number) {
    const files = parseFiles(data)
    const folders = parseFolders(data)

    if (files.length === 0 && folders.length === 0) {
      showStatus('No files selected', 'info')
      return
    }

    if (isZipDownload(folders, files)) {
      processBuildZipFile.mutate(makeZipParams(folders, files, shareLinkId))
      return
    }

    processGetSingleFile.mutate(makeSingleFileParams(files, shareLinkId))
  }

  return { onFileDownload }
}
