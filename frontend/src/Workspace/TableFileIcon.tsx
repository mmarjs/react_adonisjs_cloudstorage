import React from 'react'
import { getFileIconPath } from './common'

export function RenderIconCell(params: any) {
  if (params.row.type === 'folder') {
    const folderIcon = require(`../Image/icon_folder.svg`)
    return <img src={folderIcon.default} style={{ width: 25, height: 25 }} alt={params.row.name} />
  } else {
    const path = getFileIconPath(params.row.fileType)
    return <img src={path} style={{ width: 25, height: 25 }} alt={params.row.name} />
  }
}
