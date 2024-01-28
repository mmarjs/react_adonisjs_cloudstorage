import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import Grid from '@material-ui/core/Grid'

interface Props {
  val: string
  lim: number
}
export function Clamp(props: Props) {
  const { val, lim } = props

  if (val.length <= lim) {
    return <>{val}</>
  }

  const substring = val.substring(0, lim)

  return (
    <Grid container justify="center" alignContent="center">
      <Grid item>{substring}</Grid>
      <Grid item>
        <Tooltip title={val} arrow placement="top" disableHoverListener={false}>
          <MoreHorizIcon style={{ paddingTop: '5px' }} />
        </Tooltip>
      </Grid>
    </Grid>
  )
}
