import React from 'react'
import { useHistory } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import NavigateNextSharpIcon from '@material-ui/icons/NavigateNextSharp'
import { ReactComponent as UsersIcon } from 'Image/users.svg'
import { ReactComponent as CasesIcon } from 'Image/cases.svg'
import { ReactComponent as CustodiansIcon } from 'Image/custodians.svg'
import { ReactComponent as AcquisitionsIcon } from 'Image/acquisitions.svg'
import { ReactComponent as EvidenceLockerIcon } from 'Image/evidence_locker.svg'
import {
  MANAGE_CASES_URL,
  ACCOUNT_MANAGE_USERS_URL,
  MANAGE_CUSTODIANS_URL,
  MANAGE_ACTIVE_LOCKER,
  MANAGE_ARCHIVE_LOCKER,
  UNDER_DEVELOPMENT,
} from 'Lib'

type CardType = 'Users' | 'Cases' | 'Custodians' | 'Acquisitions' | 'ActiveLocker' | 'ArchiveLocker'

interface Props {
  amount: {
    amount: number
    unit: string
  }
  type: CardType
}

interface CardDetails {
  body: string
  amountColor: string
  subtitle: string
  footer: string
  actionColor: string
  actionName: string
  link: string
  Icon: React.FunctionComponent
  justifyIcon: 'left' | 'center' | 'right'
  gb?: true
}

export default function DashboardCard(props: Props) {
  const { amount, type } = props
  const history = useHistory()
  const card = React.useRef<CardDetails>({
    body: '',
    amountColor: '',
    subtitle: '',
    footer: '',
    actionColor: '',
    actionName: '',
    link: '',
    Icon: () => <></>,
    justifyIcon: 'left',
  })

  switch (type) {
    case 'Users':
      card.current = {
        body: '2F5597',
        amountColor: 'ffffff',
        subtitle: 'Total Users',
        footer: 'rgba(47, 85, 151, .5)',
        actionColor: 'ffffff',
        actionName: 'Manage',
        link: ACCOUNT_MANAGE_USERS_URL,
        Icon: () => <UsersIcon height="50%" id="users-icon" style={{ margin: 'auto' }} />,
        justifyIcon: 'left',
      }
      break
    case 'Cases':
      card.current = {
        body: '4472C4',
        amountColor: 'ffffff',
        subtitle: 'Total Cases',
        footer: 'rgba(68, 114, 196, .5)',
        actionColor: 'ffffff',
        actionName: 'Manage',
        link: MANAGE_CASES_URL,
        Icon: () => <CasesIcon height="50%" id="cases-icon" style={{ margin: 'auto' }} />,
        justifyIcon: 'left',
      }
      break
    case 'Custodians':
      card.current = {
        body: '5B9BD5',
        amountColor: 'ffffff',
        subtitle: 'Total Custodians',
        footer: 'rgba(91, 155, 213, .5)',
        actionColor: '000000',
        actionName: 'Report',
        link: MANAGE_CUSTODIANS_URL,
        Icon: () => <CustodiansIcon height="50%" id="custodians-icon" style={{ margin: 'auto' }} />,
        justifyIcon: 'left',
      }
      break
    case 'Acquisitions':
      card.current = {
        body: 'ED7D31',
        amountColor: 'ffffff',
        subtitle: 'Acquisitions',
        footer: 'rgba(237, 125, 49, .5)',
        actionColor: '000000',
        actionName: 'Report',
        link: UNDER_DEVELOPMENT,
        Icon: () => (
          <AcquisitionsIcon height="50%" id="acquisitions-icon" style={{ margin: 'auto' }} />
        ),
        justifyIcon: 'left',
      }
      break
    case 'ActiveLocker':
      card.current = {
        body: 'FFC000',
        amountColor: 'ffffff',
        subtitle: 'Active Locker',
        footer: 'rgba(255, 192, 0, .5)',
        actionColor: '000000',
        actionName: 'Report',
        link: MANAGE_ACTIVE_LOCKER,
        Icon: () => (
          <EvidenceLockerIcon
            height="50%"
            id="active-locker-icon"
            className="white-icon"
            style={{ margin: 'auto' }}
          />
        ),
        justifyIcon: 'left',
        gb: true,
      }
      break
    case 'ArchiveLocker':
      card.current = {
        body: '7F7F7F',
        amountColor: 'ffffff',
        subtitle: 'Archive Locker',
        footer: 'rgba(127, 127, 127, .5)',
        actionColor: '000000',
        actionName: 'Report',
        link: MANAGE_ARCHIVE_LOCKER,
        Icon: () => (
          <EvidenceLockerIcon
            height="50%"
            id="archive-locker-icon"
            className="white-icon"
            style={{ margin: 'auto' }}
          />
        ),
        justifyIcon: 'left',
        gb: true,
      }
      break
  }

  const toResource = () => {
    history.push(card.current.link)
  }

  const { Icon, subtitle, actionName, body, footer, actionColor, gb } = card.current

  const useStyles = makeStyles((theme) => ({
    root: {
      'display': 'grid',
      'grid-template-columns': '1fr',
      'grid-template-rows': '150px 35px',
      'gap': '2px 0px',
      'grid-template-areas': `
        "info"
        "manage"
      `,
      '& p': {
        color: '#ffffff',
      },
      'width': '290px',
    },
    info: {
      gridArea: 'info',
      backgroundColor: `#${body}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
    },
    manage: {
      'gridArea': 'manage',
      'display': 'flex',
      'justifyContent': 'center',
      'alignItems': 'center',
      'alignContent': 'center',
      'backgroundColor': `${footer}`,
      'cursor': 'pointer',
      '& p': {
        color: `#${actionColor}`,
      },
    },
    amount: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    amountDescription: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    sharpIcon: {
      color: '#344350',
    },
    icon: {
      '& svg ': {
        fill: '#ffffff',
      },
    },
    clickBox: {
      cursor: 'pointer',
    },
    gb: {
      fontSize: '1rem',
      marginLeft: '5px',
    },
  }))

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.info}>
        <div style={{ margin: 'auto' }}>
          <Typography display="block" className={classes.amount}>
            {gb !== undefined ? (
              <>
                {amount.amount}
                <span className={classes.gb}>{`(${amount.unit})`}</span>
              </>
            ) : (
              amount.amount
            )}
          </Typography>
          <Typography display="block" className={classes.amountDescription}>
            {subtitle}
          </Typography>
        </div>

        <Icon />
      </div>
      <div className={classes.manage} onClick={toResource}>
        <Typography align="center">{actionName}</Typography>
        <NavigateNextSharpIcon className={classes.sharpIcon} />
      </div>
    </div>
  )
}
