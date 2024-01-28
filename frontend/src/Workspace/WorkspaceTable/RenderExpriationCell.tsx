import { useDispatch } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import EditIcon from '@material-ui/icons/Edit'
import { setShareFormOpen } from 'Data/Workspace'

export function RenderExpriationCell(params: any) {
  const dispatch = useDispatch()
  return (
    <Typography style={{ display: 'flex' }} variant="subtitle1">
      {params.row.expiration !== null ? params.row.expiration : 'No expiration'}
      <EditIcon
        style={{
          fill: '#4472C4',
          cursor: 'pointer',
          marginLeft: params.row.Expiration !== null ? 0 : '55px',
        }}
        onClick={() => dispatch(setShareFormOpen(true))}
      />
    </Typography>
  )
}
