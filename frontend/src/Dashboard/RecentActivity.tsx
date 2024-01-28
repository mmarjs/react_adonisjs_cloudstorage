import React from 'react'
import { Activity } from 'types'
import dayjs from 'dayjs'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import createStyles from '@material-ui/core/styles/createStyles'
import { Theme } from '@material-ui/core/styles'
import Alert from '@material-ui/lab/Alert'

const StyledTableHeaderRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      'backgroundColor': theme.palette.primary.main,
      'color': '#fff',
      'width': '100%',
      '& th': {
        color: '#fff',
      },
    },
  })
)(TableRow)

interface Props {
  activity: Activity[]
}

export function RecentActivity(props: Props) {
  const { activity } = props

  return (
    <TableContainer component={Paper}>
      <Table aria-label="recent activities">
        <TableHead>
          <StyledTableHeaderRow>
            <TableCell>Created At</TableCell>
            <TableCell>Comapny</TableCell>
            <TableCell>Event</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Status</TableCell>
          </StyledTableHeaderRow>
        </TableHead>
        <TableBody>
          {activity ? (
            <>
              <TableContentWithData activity={activity} />
            </>
          ) : (
            <TableRow>
              <TableCell>
                <Alert severity="info">No Activity available</Alert>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function TableContentWithData(props: { activity: Activity[] }) {
  const { activity } = props
  return (
    <>
      {activity.map((item, i) => (
        <TableRow key={i}>
          <TableCell>{dayjs(item.created_at).format('DD/MM/YYYY')}</TableCell>
          <TableCell>{item.company.name}</TableCell>
          <TableCell>{item.event}</TableCell>
          <TableCell>
            <Typography display="block">
              {item.user.first_name} {item.user.last_name}
            </Typography>
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
      ))}
    </>
  )
}
