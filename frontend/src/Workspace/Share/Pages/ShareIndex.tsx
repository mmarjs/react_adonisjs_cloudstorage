import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQuery } from 'react-query'
import { AppState } from 'App/reducers'
import { ShareTemplate } from 'UI/Layout/Template/ShareTemplate'
import { ShareDownload } from './ShareDownload'
import { ShareUpload } from './ShareUpload'
import { useAxios } from 'Lib'
import { QueryKey, ShareDataAPIResponse } from 'types'
import { useShareData } from '../useShareData'
import { setFiles } from 'Data/Share'

export function ShareIndex() {
  const axios = useAxios()
  const dispatch = useDispatch()
  const { handleDownloadData } = useShareData()
  const [count, setCount] = useState(0)
  const shareLink = useSelector((state: AppState) => state.share.shareLink)

  const getTitle = (shareType: string) => {
    switch (shareType) {
      case 'upload':
        return 'Secure Upload'
      case 'download':
        return 'Secure Download'
      default:
        return 'Secure File Share'
    }
  }

  const title = getTitle(shareLink.share_type)

  const increment = () => {
    const next = count + 1
    setCount(next)
  }

  const shareUserData = async (): Promise<ShareDataAPIResponse> => {
    const { data } = await axios.get(`/share/data/${shareLink.link}`)
    return data
  }

  useQuery(QueryKey.workspaceShareUserData, shareUserData, {
    onSuccess: (data) => {
      dispatch(setFiles(data.files))

      if (shareLink.share_type === 'download') {
        const files = data.files ?? []
        handleDownloadData(files)
      }
      increment()
    },
  })

  return (
    <>
      <ShareTemplate title={title}>
        {shareLink.share_type === 'upload' && <ShareUpload />}
        {shareLink.share_type === 'download' && <ShareDownload />}
      </ShareTemplate>
    </>
  )
}
