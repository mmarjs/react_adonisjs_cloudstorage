import React, { useState } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useDispatch, useSelector } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Box from '@material-ui/core/Box'
import { ReactComponent as FormatListBulletedIcon } from 'Image/icon_table_thumbnail.svg'
import { useIsMounted } from 'Lib'
import { setSwitchViewMode } from 'Data/Workspace'
import { AppState } from 'App/reducers'

const useStyles = makeStyles((theme) => ({
  icon: {
    margin: '0',
    fontSize: '2rem',
  },
  toolBarIcon: {
    cursor: 'pointer',
    width: '20px',
  },
  fieldMenuItem: {
    height: '30px',
    color: '#5FB158',
  },
  fieldMenuItemActive: {
    height: '30px',
    color: '#5FB158',
    background: '#e2dfdf',
  },
}))

export function SwitchViewMenu() {
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const dispatch = useDispatch()
  const openMenu = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }

  const closeMenu = () => {
    setSafely(setAnchorEl, null)
  }

  const onChangeSwitchViewMode = (mode: string) => {
    dispatch(setSwitchViewMode(mode))
    setSafely(setAnchorEl, null)
  }

  const switchMode = useSelector((state: AppState) => state.workspaceData.mode)
  return (
    <>
      <Box display="flex" alignItems="center">
        <FormatListBulletedIcon className={classes.toolBarIcon} onClick={openMenu} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MenuItem
          className={switchMode === 'small' ? classes.fieldMenuItemActive : classes.fieldMenuItem}
          onClick={() => onChangeSwitchViewMode('small')}
        >
          Small
        </MenuItem>
        <MenuItem
          className={switchMode === 'medium' ? classes.fieldMenuItemActive : classes.fieldMenuItem}
          onClick={() => onChangeSwitchViewMode('medium')}
        >
          Medium
        </MenuItem>
        <MenuItem
          className={switchMode === 'large' ? classes.fieldMenuItemActive : classes.fieldMenuItem}
          onClick={() => onChangeSwitchViewMode('large')}
        >
          Large
        </MenuItem>
      </Menu>
    </>
  )
}
