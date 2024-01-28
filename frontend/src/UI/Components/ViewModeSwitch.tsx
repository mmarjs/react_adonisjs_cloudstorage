import React, { useState } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Switch from '@material-ui/core/Switch'
import { ViewModeSwitchProps } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
}))

export function ViewModeSwitch(props: ViewModeSwitchProps) {
  const { onChangeViewMode } = props
  const classes = useStyles()
  const [checked, setChecked] = useState<boolean | undefined>(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    onChangeViewMode(event)
  }

  return (
    <div className={classes.root}>
      <span>{checked ? 'Table View' : 'Card View'}</span>
      <Switch
        checked={checked}
        onChange={handleChange}
        color="primary"
        name="checkedB"
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
    </div>
  )
}
