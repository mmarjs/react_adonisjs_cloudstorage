import { ReactComponent as SharedIcon } from 'Image/icon_shared.svg'

export function RenderShareCell(params: any) {
  if (params.value === 'Share') {
    return <SharedIcon style={{ width: '20px', height: '20px', fill: '#5FB158' }} />
  } else {
    return params.value
  }
}
