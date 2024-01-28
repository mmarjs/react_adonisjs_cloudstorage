import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

/** Data */
import { useSelector, useDispatch } from 'react-redux'
import { setShowArchived } from 'Data/UI'
import { AppState } from 'App/reducers'

/** Material UI */
import makeStyles from '@material-ui/core/styles/makeStyles'
import Menu from '@material-ui/core/Menu'
import MoreVertIcon from '@material-ui/icons/MoreVert'

/** Helpers */
import { useIsMounted } from 'Lib'
import { ActionMenuProps } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    'maxHeight': '250px',
    '& .MuiMenu-paper': {
      '&::-webkit-scrollbar-track': {
        borderRadius: '10px',
        backgroundColor: '#dbefda',
      },
      '&::-webkit-scrollbar': {
        width: '7px',
        backgroundColor: '#F5F5F5',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '10px',
        backgroundColor: '#5FB158',
      },
    },
  },
  icon: {
    margin: '0',
    fontSize: '2rem',
  },
}))

export function ActionMenu(props: ActionMenuProps) {
  const { MenuItems } = props
  const classes = useStyles()
  const history = useHistory()
  const { setSafely } = useIsMounted()
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const showArchived = useSelector((state: AppState) => state.ui.showArchived)

  const openMenu = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }

  const closeMenu = () => {
    setSafely(setAnchorEl, null)
  }

  const navigate = (url: string) => {
    if (url === 'toggle-show-archived') {
      dispatch(setShowArchived(!showArchived))
    } else {
      history.push(url)
      setSafely(setAnchorEl, null)
    }
  }

  if (MenuItems === undefined) {
    return <></>
  }

  return (
    <>
      <MoreVertIcon className={classes.icon} onClick={openMenu} />
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        className={classes.root}
      >
        <MenuItems navigate={(url: string) => navigate(url)} />
      </Menu>
    </>
  )
}
