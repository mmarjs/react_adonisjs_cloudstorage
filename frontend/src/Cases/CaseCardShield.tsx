import React from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { ReactComponent as EvidenceLockerIcon } from 'Image/evidence_locker.svg'
import { Case } from 'types'
import find from 'lodash-es/find'
import { displayGigCount } from 'Lib'

interface Props {
  item: Case | undefined
  id: boolean
}

export default function CaseCardShield(props: Props) {
  const { item, id } = props
  const breakoutBgColor = item?.status === 'active' ? '#4472C4' : '#7F7F7F'
  const breakoutIconColor = item?.status === 'active' ? '#2F5597' : '#595959'
  const lockerName = item?.status === 'active' ? 'Case Locker' : 'Case Archived'
  const totalFileSizeByCase = useSelector((state: AppState) => state.cases.totalFileSizeByCase)

  const useStyles = makeStyles((theme) => ({
    root: {
      'alignItems': 'center',
      'display': 'grid',
      'grid-template-columns': '0.6fr 1fr',
      'grid-template-rows': '1fr',
      'gap': '5px 10px',
      'grid-template-areas': `
      "icon text"
        `,
      'height': '100px',
      // 'width': '175px',
      'padding': '0.5rem 1rem',
      'backgroundColor': `${breakoutBgColor}`,
      'margin': 'auto',
    },
    icon: {
      'grid-area': 'icon',
      'margin-top': '7px',
    },
    text: {
      'grid-area': 'text',
      'display': 'flex',
      'justifyContent': 'flex-end',
    },
    evidenceIcon: {
      'height': '60px',
      '& path': {
        fill: `${breakoutIconColor}`,
      },
    },
    evidenceText: {
      color: '#fff',
      fontSize: '0.8rem',
    },
    lockerName: {
      color: '#fff',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap',
    },
    gigabytes: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: '2.9rem',
      marginRight: '5px',
    },
    gigUnit: {
      fontSize: '.7rem',
    },
  }))

  const classes = useStyles()

  const getGBsize = () => {
    const fileSize = find(totalFileSizeByCase, { case_id: item?.id })
    let temp_count = []
    temp_count['amount'] = displayGigCount(fileSize?.totalSize)[0]
    temp_count['unit'] = displayGigCount(fileSize?.totalSize)[1]
    return temp_count
  }

  return (
    <>
      <div className={classes.root} style={{ width: id ? '200px' : '100%' }}>
        <div className={classes.icon}>
          <EvidenceLockerIcon className={classes.evidenceIcon} />
        </div>
        <div className={classes.text}>
          <div>
            <Typography className={classes.evidenceText}>
              <span className={classes.gigabytes}>{getGBsize()['amount']}</span>
              <span className={classes.gigUnit}>{getGBsize()['unit']}</span>
            </Typography>
            <Typography className={classes.lockerName}>{lockerName}</Typography>
          </div>
        </div>
      </div>
    </>
  )
}
