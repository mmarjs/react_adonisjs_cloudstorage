import dayjs from 'dayjs'
import { ShareDataItem, AdvancedSearchFilterItem } from './types'
import { WorkSpaceSearchBody } from 'types'

const FileTypeIcons = {
  'MS Word': 'DOC_trans.svg',
  'MS Excel': 'XLS_trans.svg',
  'MS Power Point': 'PPT_trans.svg',
  'MS One Note': 'ONE_trans.svg',
  'MS Outlook': 'PST_trans.svg',
  'MS Publisher': 'PUB_trans.svg',
  'MS Access': 'MDB_trans.svg',
  'AAC': 'UNK_trans.svg',
  'AAIF': 'UNK_trans.svg',
  'FLAC': 'UNK_trans.svg',
  'MP3': 'MP3_trans.svg',
  'MPA': 'UNK_trans.svg',
  'OGG': 'UNK_trans.svg',
  'Audio Wav': 'WAV_trans.svg',
  'WMA Audio': 'WMA_trans.svg',
  '3GP': 'UNK_trans.svg',
  'AVI': 'AVI_trans.svg',
  'DV': 'UNK_trans.svg',
  'FLV': 'FLV_trans.svg',
  'H.261': 'UNK_trans.svg',
  'H.263': 'UNK_trans.svg',
  'H.264': 'UNK_trans.svg',
  'M1V': 'UNK_trans.svg',
  'M2V': 'UNK_trans.svg',
  'M4V': 'UNK_trans.svg',
  'MOV': 'MOV_trans.svg',
  'MP2': 'UNK_trans.svg',
  'MP4': 'MP4_trans.svg',
  'MPEG': 'MPEG_trans.svg',
  'Real Video': 'UNK_trans.svg',
  'GIF': 'GIF_trans.svg',
  'ICO': 'UNK_trans.svg',
  'JPEG': 'JPG_trans.svg',
  'PNG': 'PNG_trans.svg',
  'PSD': 'PSD_trans.svg',
  'SVG': 'SVG_trans.svg',
  'TIFF': 'TIFF_trans.svg',
  'Bitmap': 'BMP_trans.svg',
  'PDF': 'PDF_trans.svg',
  'Encase Image': 'UNK_trans.svg',
  'Zip': 'ZIP_trans.svg',
  'Text file': 'TXT_trans.svg',
  'Unknown': 'UNK_trans.svg',
  'PST': 'PST_trans.svg',
}

export function getExpiresDate(data: ShareDataItem): string | undefined {
  try {
    let expiresDate: string = ''
    if (data.expires === 1) {
      expiresDate = dayjs().add(3, 'day').toISOString()
    } else if (data.expires === 2) {
      expiresDate = dayjs().add(7, 'day').toISOString()
    } else if (data.expires === 3) {
      expiresDate = dayjs().add(30, 'day').toISOString()
    } else if (data.expires === 4) {
      expiresDate = dayjs(data.date + ' ' + data.time).toISOString()
    }
    let expiresDateParam: string | undefined = ''
    if (data.expires !== 0) {
      expiresDateParam = expiresDate
    } else {
      expiresDateParam = undefined
    }
    return expiresDateParam
  } catch (err) {}
}

export function getSearchBody(
  data: AdvancedSearchFilterItem,
  folder_Id: number,
  category_id: number,
  page: number,
  limit: number
): WorkSpaceSearchBody {
  const categoryData: any = ['workgroup', 'personal', 'evidence', 'shared']
  let searchBody: WorkSpaceSearchBody = {
    search_type: 'advanced',
    filename: data.name,
    folder_id: folder_Id,
    status: 'active',
    category: categoryData[data.location],
    category_id: category_id,
    page: page,
    limit: limit,
  }
  let size: any = {}
  if (data.sizecondition !== 0) {
    size.gt = data.sizecondition === 1 ? true : false
    size.lt = data.sizecondition === 2 ? true : false
    let calcSize: number = 0
    if (data.sizetype === 0) {
      calcSize = parseFloat(data.size ? data.size : '0') * 1024
    } else if (data.sizetype === 1) {
      calcSize = parseFloat(data.size ? data.size : '0') * 1024 * 1024
    } else calcSize = parseFloat(data.size ? data.size : '0') * 1024 * 1024 * 1024
    size.bytes = data.size ? calcSize : 0
    searchBody.size = size
  }
  let modifiedDate: any = {}
  if (data.modifieddate !== 0) {
    modifiedDate.exactly = data.modifieddate === 1 ? data.firstdate : ''
    modifiedDate.before = data.modifieddate === 2 ? data.firstdate : ''
    modifiedDate.after = data.modifieddate === 3 ? data.firstdate : ''
    if (data.modifieddate === 4) {
      modifiedDate.between = {
        before: data.firstdate,
        after: data.seconddate,
      }
    }
    searchBody.last_modified = modifiedDate
  }
  let temp_access: any = {}
  if (data.access !== 0) {
    temp_access = data.access === 1 ? 'private' : 'shared'
    searchBody.access = temp_access
  }
  let temp_file_type: any = {}
  if (data.type !== 'Any') {
    temp_file_type.category = data.type !== 'Extension' ? data.type : ''
    temp_file_type.extension = data.type === 'Extension' ? data.extension : ''
    searchBody.file_type = temp_file_type
  }
  let owner: any = {}
  if (data.owner !== 0) {
    owner.owner_id = data.owner
    searchBody.owner = owner
  }
  return searchBody
}

export function getFileIconPath(type: string) {
  try {
    if (FileTypeIcons[type]) {
      const fileIcon = require(`../Image/file_type_icons/${FileTypeIcons[type]}`)
      return fileIcon.default
    }
    const fileIcon = require(`../Image/file_type_icons/UNK_trans.svg`)
    return fileIcon.default
  } catch (err) {}
}
