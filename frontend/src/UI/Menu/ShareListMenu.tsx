import React, { useState } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Box from '@material-ui/core/Box'
import { ReactComponent as SharedIcon } from 'Image/icon_shared.svg'
import { useIsMounted } from 'Lib'

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
}))

interface ShareListMenuProp {
  onChangeShareMode: (mode: string) => void
}

export function ShareListMenu(props: ShareListMenuProp) {
  const { onChangeShareMode } = props
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const openMenu = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }

  const closeMenu = () => {
    setSafely(setAnchorEl, null)
  }

  const onSetShareMode = (mode: string) => {
    onChangeShareMode(mode)
    setSafely(setAnchorEl, null)
  }

  return (
    <>
      <Box display="flex" alignItems="center">
        <SharedIcon className={classes.toolBarIcon} onClick={openMenu} />
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
        <MenuItem className={classes.fieldMenuItem} onClick={() => onSetShareMode('download')}>
          Secure Download Link
        </MenuItem>
        <MenuItem className={classes.fieldMenuItem} onClick={() => onSetShareMode('upload')}>
          Secure Upload Link
        </MenuItem>
        <MenuItem className={classes.fieldMenuItem} onClick={() => onSetShareMode('management')}>
          Share Management
        </MenuItem>
      </Menu>
    </>
  )
}
