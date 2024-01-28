import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import { ActionMenuItemsProps } from 'types'

export function HomeMenu(props: ActionMenuItemsProps) {
  const handleNewCase = () => {}

  return (
    <>
      <MenuItem onClick={handleNewCase}>Home</MenuItem>
    </>
  )
}
