import { RenderShareIconCell } from './WorkspaceTable/RenderShareIconCell'
import { RenderExpriationCell } from './WorkspaceTable/RenderExpriationCell'
import { RenderShareCell } from './WorkspaceTable/RenderShareCell'
import { RenderIconCell } from './TableFileIcon'
import { displayFileSize } from 'Lib'

export const FieldCells: any[] = [
  {
    type: 'workgroup',
    fieldList: [
      {
        field: 'icon',
        headerName: 'Icon',
        width: 50,
        resizable: false,
        type: 'render',
        renderCell: RenderIconCell,
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 100,
        type: 'string',
      },
      {
        field: 'modifiedDate',
        headerName: 'Modified Date',
        width: 200,
        type: 'string',
      },
      {
        field: 'size',
        headerName: 'Size',
        width: 100,
        valueFormatter: (params) => {
          return params?.row.type === 'file' ? displayFileSize(params.value) : ''
        },
        cellClassName: 'table-size-cell',
      },
      {
        field: 'access',
        headerName: 'Access',
        width: 100,
        type: 'string',
        renderCell: (params: any) => RenderShareCell(params),
      },
      {
        field: 'owner',
        headerName: 'Owner',
        width: 150,
        type: 'string',
      },
      {
        field: 'notes',
        headerName: 'Notes',
        flex: 0.1,
        type: 'string',
      },
    ],
  },
  {
    type: 'personal',
    fieldList: [
      {
        field: 'icon',
        headerName: 'Icon',
        width: 50,
        resizable: false,
        type: 'render',
        renderCell: RenderIconCell,
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 100,
        type: 'string',
      },
      {
        field: 'modifiedDate',
        headerName: 'Modified Date',
        width: 200,
        type: 'string',
      },
      {
        field: 'size',
        headerName: 'Size',
        width: 100,
        valueFormatter: (params) => {
          return params?.row.type === 'file' ? displayFileSize(params.value) : ''
        },
        cellClassName: 'table-size-cell',
      },
      {
        field: 'owner',
        headerName: 'Owner',
        width: 150,
        type: 'string',
      },
      {
        field: 'access',
        headerName: 'Access',
        width: 100,
        type: 'string',
        renderCell: (params: any) => RenderShareCell(params),
      },
      {
        field: 'notes',
        headerName: 'Notes',
        flex: 0.1,
        type: 'string',
      },
    ],
  },
  {
    type: 'search',
    fieldList: [
      {
        field: 'icon',
        headerName: 'Icon',
        width: 50,
        resizable: false,
        type: 'render',
        renderCell: RenderIconCell,
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 100,
        type: 'string',
      },
      {
        field: 'folder',
        headerName: 'Folder',
        width: 150,
        type: 'string',
      },
      {
        field: 'modifiedDate',
        headerName: 'Modified Date',
        width: 200,
        type: 'string',
      },
      {
        field: 'size',
        headerName: 'Size',
        width: 100,
        valueFormatter: (params) => {
          return params?.row.type === 'file' ? displayFileSize(params.value) : ''
        },
        cellClassName: 'table-size-cell',
      },
      {
        field: 'owner',
        headerName: 'Owner',
        width: 150,
        type: 'string',
      },
      {
        field: 'access',
        headerName: 'Access',
        width: 100,
        type: 'string',
        renderCell: (params: any) => RenderShareCell(params),
      },
      {
        field: 'notes',
        headerName: 'Notes',
        flex: 0.1,
        type: 'string',
      },
    ],
  },
  {
    type: 'share',
    fieldList: [
      {
        field: 'icon',
        headerName: 'Icon',
        width: 50,
        resizable: false,
        type: 'render',
        renderCell: (params: any) => RenderShareIconCell(params),
      },
      {
        field: 'userName',
        headerName: 'Shared Username',
        width: 200,
        type: 'string',
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'phone',
        headerName: 'Phone',
        width: 100,
        type: 'string',
        hide: true,
      },
      {
        field: 'dateShared',
        headerName: 'Date Shared',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'accessType',
        headerName: 'Access Type',
        width: 150,
        type: 'string',
        hide: true,
      },
      {
        field: 'sharedBy',
        headerName: 'Shared By',
        width: 150,
        type: 'string',
        hide: true,
      },
      {
        field: 'expiration',
        headerName: 'Expiration',
        flex: 0.2,
        type: 'string',
        renderCell: (params: any) => RenderExpriationCell(params),
      },
      {
        field: 'lastLogin',
        headerName: 'Last Login',
        width: 100,
        type: 'string',
        hide: true,
      },
    ],
  },
  {
    type: 'recycle',
    fieldList: [
      {
        field: 'icon',
        headerName: 'Icon',
        width: 50,
        resizable: false,
        type: 'render',
        renderCell: RenderIconCell,
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'location',
        headerName: 'Location',
        width: 200,
        type: 'string',
      },
      {
        field: 'size',
        headerName: 'Size',
        width: 100,
        valueFormatter: (params) => {
          return params?.row.type === 'file' ? displayFileSize(params.value) : ''
        },
        cellClassName: 'table-size-cell',
      },
      {
        field: 'fileType',
        headerName: 'FileType',
        width: 200,
        type: 'string',
        hide: true,
      },
      {
        field: 'dateDeleted',
        headerName: 'Date Deleted',
        width: 200,
        type: 'string',
      },
      {
        field: 'deletedBy',
        headerName: 'Deleted By',
        flex: 0.2,
        type: 'string',
      },
      {
        field: 'access',
        headerName: 'Access',
        width: 200,
        type: 'string',
        hide: true,
      },
      {
        field: 'notes',
        headerName: 'Notes',
        width: 200,
        type: 'string',
        hide: true,
      },
    ],
  },
]
