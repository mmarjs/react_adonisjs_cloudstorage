import React from 'react'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'

interface Props {
  Icon: () => JSX.Element
  text: string
}

export function IconTitle(props: Props) {
  const { Icon, text } = props

  const useStyles = makeStyles((theme) => ({
    root: {
      'display': 'grid',
      'grid-template-columns': '35px 1fr',
      'grid-template-rows': '1fr',
      'gap': '0px 0px',
      'grid-template-areas': `
        "icon text"
        `,
      'alignItems': 'flex-start',
    },
    icon: {
      gridArea: 'icon',
    },
    text: {
      marginLeft: '10px',
      gridArea: 'text',
    },
  }))

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <div className={classes.icon}>
        <Icon />
      </div>
      <div className={classes.text}>
        <Typography variant="h2">{text}</Typography>
      </div>
    </div>
  )
}
