import { ReactComponent as IconDownload } from '../../Image/download.svg'
import { ReactComponent as IconUpload } from '../../Image/icon_upload.svg'
import { ReactComponent as IconUploadDownnload } from '../../Image/icon_upload_download.svg'

export function RenderShareIconCell(params: any) {
  if (params.row.icon === 'upload') {
    return <IconUpload style={{ width: 30, height: 30, fill: '#C79500' }} />
  } else if (params.row.icon === 'download') {
    return <IconDownload style={{ width: 30, height: 30, fill: '#5FB158' }} />
  } else {
    return <IconUploadDownnload style={{ width: 30, height: 30, fill: '#4472C4' }} />
  }
}
