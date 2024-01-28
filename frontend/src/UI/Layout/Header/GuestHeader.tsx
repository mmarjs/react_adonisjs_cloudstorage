import React from 'react'
import logo from 'Image/logo.png'
import { Link } from 'react-router-dom'
import { HOME_URL } from 'Lib'
import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles((theme) => ({
  img: {
    objectFit: 'cover',
    height: '4rem',
    backgroundColor: '#fff',
  },
}))

export function GuestHeader() {
  const classes = useStyles()

  return (
    <Box m={0} style={{ height: '4rem' }}>
      <Link to={HOME_URL}>
        <img src={logo} alt={'logo'} className={classes.img} />
      </Link>
    </Box>
  )
}
