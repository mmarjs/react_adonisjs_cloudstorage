import { useDispatch } from 'react-redux'
import { setSharedFileData } from 'Data/Share'
import { displayFileSize } from 'Lib'
import dayjs from 'dayjs'

export function useShareData() {
  const dispatch = useDispatch()

  // For the download share_type
  const handleDownloadData = (files: any[]) => {
    let fileData: any[] = []

    for (let file of files) {
      let fileItem: any = []
      fileItem.id = file.id
      fileItem.name = file.name
      fileItem.size = displayFileSize(file.size)
      fileItem.type = 'file'
      fileItem.fileType = file.fileType?.name
      fileItem.modifiedDate = dayjs(file.updated_at).format('YYYY-MM-DD hh:mm:ss A')
      fileItem.action = true
      fileData.push(fileItem)
    }
    dispatch(setSharedFileData(fileData))
  }

  return { handleDownloadData }
}
