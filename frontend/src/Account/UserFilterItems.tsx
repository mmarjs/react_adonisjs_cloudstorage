import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'

export function UserFilterItems() {
  return (
    <>
      <MenuItem>Include Suspended User</MenuItem>
      <MenuItem>Sort By Oldest</MenuItem>
    </>
  )
}
