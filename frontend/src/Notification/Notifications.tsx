import { useState } from 'react'

/** Data */
import { AppState } from 'App/reducers'
import { useSelector } from 'react-redux'
import useNotification from 'Notification/useNotification'

/** Material UI */
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import NotificationsIcon from '@material-ui/icons/Notifications'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import useTheme from '@material-ui/core/styles/useTheme'
import Menu from '@material-ui/core/Menu'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Badge from '@material-ui/core/Badge'
import ClearIcon from '@material-ui/icons/Clear'

/** Helpers */
import { Notification } from 'types'
import { useIsMounted, relativeDate } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    'maxWidth': '500px',
    'maxHeight': '600px',
    '& ul': {
      paddingBottom: '0px',
    },
  },
  table: {
    minWidth: '450px',
  },
  icon: {
    color: '#000000',
    marginTop: '18px',
  },
  badge: {
    marginTop: '18px',
  },
  trashIcon: {
    width: 17,
    fill: '#4472C4',
    cursor: 'pointer',
  },
  message: {
    fontSize: '12px',
    overflowWrap: 'break-word',
    hyphens: 'manual',
  },
  date: {
    fontSize: '10px',
    color: '#606060',
  },
  dismissAll: {
    textAlign: 'center',
    cursor: 'pointer',
    color: theme.palette.blue.main,
    paddingLeft: '50px',
  },
}))

export function Notifications() {
  const theme = useTheme()
  const classes = useStyles()
  const isXsWidth = useMediaQuery(theme.breakpoints.down('xs'))
  const { setSafely } = useIsMounted()
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const { dismissNotification, dismissAllNotifications } = useNotification()
  const notifications = useSelector((state: AppState) => state.notifications.notifications)
  const textCellWidth = isXsWidth === true ? '80%' : '95%'
  const trashCellWidth = isXsWidth === true ? '20%' : '5%'

  const onOpen = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }

  const onClose = () => {
    setSafely(setAnchorEl, null)
  }

  const dismiss = (id: number) => {
    dismissNotification(id).then(() => {})
  }

  const dismissAll = () => {
    dismissAllNotifications().then(() => {})
  }

  const Row = (props: { notification: Notification }) => {
    const { notification } = props
    const classes = useStyles()

    return (
      <TableRow>
        <TableCell>
          <Typography display="block" variant="body1" className={classes.message}>
            {notification.message}
          </Typography>

          <Typography variant="caption" className={classes.date}>
            {relativeDate(notification.created_at)}
          </Typography>
        </TableCell>
        <TableCell>
          <ClearIcon
            className={classes.trashIcon}
            onClick={() => {
              dismiss(notification.id)
            }}
          />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div>
      {isXsWidth ? (
        <Badge badgeContent={notifications.length} color="error" id="badge">
          <NotificationsIcon className={classes.icon} onClick={onOpen} />
        </Badge>
      ) : (
        <Badge
          badgeContent={notifications.length}
          className={classes.badge}
          color="error"
          id="badge"
        >
          <NotificationsIcon
            id="notification-icon"
            onMouseEnter={(e) => {
              setSafely(setAnchorEl, e.currentTarget)
            }}
          />
        </Badge>
      )}

      <div className={classes.root} id="notification-root">
        <Menu
          id="user-header-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={onClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          className={classes.root}
        >
          <TableContainer>
            <Table className={classes.table}>
              <TableBody>
                <TableRow>
                  <TableCell width={textCellWidth} size="small">
                    <div onClick={dismissAll}>
                      <Typography className={classes.dismissAll}>
                        Dismiss All Notifications
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell width={trashCellWidth} size="small" />
                </TableRow>
                {notifications.length > 0 &&
                  notifications.map((notification, index) => (
                    <Row notification={notification} key={index} />
                  ))}
                {notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography align="center">No notifications!</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Menu>
      </div>
    </div>
  )
}
