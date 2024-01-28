import React, { useContext } from 'react'
import { useAxios } from 'Lib'
import Uppy from '@uppy/core'
import dayjs from 'dayjs'
import cuid from 'cuid'
import slugify from 'slugify'
import useAuthToken from 'Auth/useAuthToken'
import RecordFilePlugin from './RecordFilePlugin'
import { UploadContext } from './UploadProvider'
import { UploadProps, ActiveFileItem, RecordFileOptions } from 'types'
import AwsS3Multipart from '@uppy/aws-s3-multipart'
import { useUppy, Dashboard, DashboardModal } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles((theme) => ({
  root: {
    uploadIcon: {
      '& path': {
        fill: theme.palette.primary.main,
      },
    },
    width: '50%',
    margin: 'auto',
  },
}))

export function Upload(props: UploadProps) {
  const axios = useAxios()
  const classes = useStyles()
  const { token } = useAuthToken()
  const { fileItems, addFileItem, removeFileItem, updateItemStatus } = useContext(UploadContext)
  const isDebug = process.env.NODE_ENV === 'production' ? false : true
  const companionUrl = `${process.env.REACT_APP_UPLOAD_URL}`

  const safeFileName = (filename: string): string => {
    const base = filename.trim()
    const stripDoubleSpaces = base.replaceAll('  ', ' ')
    return stripDoubleSpaces
  }

  const generateWasabiPath = (filename: string): string => {
    const nonce = cuid()
    const slug = slugify(filename.trim())

    return `${props.category}-${props.categoryId}/${nonce}/${slug}`
  }

  const recordUploadedFiles = async (params: Map<string, ActiveFileItem>) => {
    let items: ActiveFileItem[] = []

    params.forEach((data) => {
      if (data.status === 'uploaded') {
        items.push(data)
      }
    })

    if (items.length === 0) {
      console.error(`Cannot create 0 files`)
      return false
    }

    try {
      await axios.post('/files/create', {
        folderId: props.folderId,
        resource: props.category,
        shareLinkId: props.shareLinkId,
        files: items,
      })

      items.forEach((item) => {
        removeFileItem(item.filename)
      })
    } catch (err) {
      return false
    } finally {
      if (props.onFechData) {
        props.onFechData()
      }
    }
  }

  const uppy = useUppy(() => {
    const up = Uppy({
      debug: isDebug,
      autoProceed: false,
      infoTimeout: 2e5,
      restrictions: {
        maxFileSize: 5e12,
        maxTotalFileSize: 5e12,
        minNumberOfFiles: 1,
        maxNumberOfFiles: 1000,
      },
      onBeforeFileAdded: (currentFile, files) => {
        const modifiedFile = {
          ...currentFile,
          name: `${safeFileName(currentFile.name)}`,
        }
        return modifiedFile
      },
      onBeforeUpload: (files) => {
        const values = Object.values(files)

        for (let value of values) {
          const wasabiPath = generateWasabiPath(value.name)

          addFileItem(value.name, {
            resource: props.category,
            folder_id: props.folderId,
            filename: value.name,
            size: value.size,
            path: wasabiPath,
            // @ts-ignore
            last_modified: dayjs(value.data.lastModifiedDate).toISOString(),
            status: 'pending',
          })

          up.setFileMeta(value.id, { wasabiPath: wasabiPath })
        }

        return files
      },
    })

    up.use(AwsS3Multipart, {
      limit: 4,
      companionUrl: companionUrl,
      companionHeaders: {
        'uppy-auth-token': `${token}|${props.category}`,
      },
      getChunkSize: () => 1e8,
    })

    const recordOpts: RecordFileOptions = {
      id: 'RecordFile',
      fileItems: fileItems.current,
    }

    up.use(RecordFilePlugin, recordOpts)

    up.on('upload-success', (file) => {
      updateItemStatus(file.name, 'uploaded')
    })

    up.on('complete', async (result) => {
      if (result.successful.length > 0) {
        await recordUploadedFiles(fileItems.current)
      }
    })

    up.on('error', (error) => {
      console.error(error)
    })

    up.on('upload-error', (file) => {
      updateItemStatus(file?.name, 'crashed')
    })

    up.on('cancel-all', async (result) => {
      const files: ActiveFileItem[] = []

      for (let file of fileItems.current.values()) {
        files.push(file)
      }

      const activeFiles = files.filter((f) => f.status === 'uploaded')

      if (activeFiles.length > 0) {
        await recordUploadedFiles(fileItems.current)
      }
    })

    up.on('file-removed', (file) => {
      removeFileItem(file?.name)
    })

    return up
  })

  return (
    <div className={classes.root}>
      {props.display === 'inline' ? (
        <Dashboard
          uppy={uppy}
          width="100%"
          height="400px"
          locale={{
            strings: {
              dropHereOr: 'Drop here or %{browse}',
              browse: 'Browse',
            },
          }}
          showLinkToFileUploadResult={false}
          proudlyDisplayPoweredByUppy={false}
          disableThumbnailGenerator={true}
          fileManagerSelectionType="files"
          thumbnailWidth={0}
        />
      ) : (
        <DashboardModal
          uppy={uppy}
          closeModalOnClickOutside
          open={props.open}
          onRequestClose={props.onRequestClose}
          proudlyDisplayPoweredByUppy={false}
          showLinkToFileUploadResult={false}
          disableThumbnailGenerator={true}
          fileManagerSelectionType="files"
          thumbnailWidth={0}
        />
      )}
    </div>
  )
}
