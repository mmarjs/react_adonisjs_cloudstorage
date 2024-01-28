import React, { useRef, MutableRefObject } from 'react'
import { ActiveFileItem } from 'types'
import { produce } from 'immer'

export interface UploadStore {
  fileItems: MutableRefObject<Map<string, ActiveFileItem>>
  addFileItem: (key: string, fileItem: ActiveFileItem) => void
  removeFileItem: (key: string) => void
  updateItemStatus: (filename: string, status: 'pending' | 'uploaded' | 'crashed') => void
}

interface Props {
  children: React.ReactNode
}

const placeholder = {} as UploadStore
export const UploadContext = React.createContext<UploadStore>(placeholder)

export function UploadProvider(props: Props) {
  const fileItems = useRef(new Map<string, ActiveFileItem>())

  const addFileItem = (key: string, fileItem: ActiveFileItem) => {
    fileItems.current.set(key, fileItem)
  }

  const removeFileItem = (key: string) => {
    if (fileItems.current.has(key)) {
      fileItems.current.delete(key)
    }
  }

  const updateItemStatus = (key: string, status: 'pending' | 'uploaded' | 'crashed'): void => {
    const item = fileItems.current.get(key)

    if (item) {
      const nextItem = produce(item, (draft) => {
        draft.status = status
      })

      fileItems.current.set(key, nextItem)
    }
  }

  return (
    <UploadContext.Provider
      value={{
        fileItems,
        addFileItem,
        removeFileItem,
        updateItemStatus,
      }}
    >
      <>{props.children}</>
    </UploadContext.Provider>
  )
}
