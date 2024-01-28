import { useContext } from 'react'

/** Data */
import { ManageUsersContext } from 'Users/ManageUsers/ManageUsersProvider'

/** Material UI */
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** Images */
import { ReactComponent as UserIcon } from 'Image/user.svg'

const useStyles = makeStyles({
  root: {
    '& > :hover': {
      filter: 'brightness(1.05) drop-shadow(1px 1px 1px #023047)',
    },
  },
  icon: {
    'height': '6rem',
    'width': '6rem',
    '& path': {
      'fill': `#005828`,
      'stroke': '#1F2431',
      'stroke-width': '1px',
    },
    '& circle': {
      'fill': `#005828`,
      'stroke': '#1F2431',
      'stroke-width': '1px',
    },
  },
  container: {
    'display': 'grid',
    'grid-template-columns': '1fr',
    'grid-template-rows': '7rem 0.25rem',
    'gap': '0px 0px',
    'grid-template-areas': `
      "main"
      "footer"`,
    'width': '210px',
    'height': '150px',
    'backgroundColor': '#00B050',
    'color': '#fff',
    'cursor': 'pointer',
    'border-radius': '20px',
    'padding': '0.5rem',
  },
  footer: {
    'grid-area': 'footer',
    'display': 'flex',
    'justifyContent': 'center',
  },
  main: {
    'grid-area': 'main',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
  },
  title: {
    color: '#fff',
    fontSize: '1.4rem',
  },
  subTitle: {
    color: '#fff',
    fontSize: '0.8rem',
  },
})

export default function EmployeeButton() {
  const classes = useStyles()
  const { manageUsers: data } = useContext(ManageUsersContext)

  const onOpen = () => {
    if (data.employeeInfo.current < data.employeeInfo.max) {
      data.employeeInviteModalOpen = true
    } else {
      data.errorMessage = 'Max Number of Employees Reached'

      setTimeout(() => {
        data.errorMessage = ''
      }, 250)
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.container} onClick={onOpen}>
        <div className={classes.main}>
          <UserIcon className={classes.icon} />
          <Typography className={classes.title}>Create Employee</Typography>
        </div>
        <div className={classes.footer}>
          <Typography className={classes.subTitle} align="center">
            Create External Employee
          </Typography>
        </div>
      </div>
    </div>
  )
}
