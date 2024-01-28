import { useHistory } from 'react-router-dom'

/** Data */
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'

import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { AccountRole, Case } from 'types'
import clsx from 'clsx'
import { CASE_URL, clamp, canAccessCase } from 'Lib'

interface Props {
  caseInstance?: Case
  limit?: number
  id: boolean
}

const useStyles = makeStyles((theme) => ({
  hoverPointer: {
    '& :hover': {
      cursor: 'pointer',
    },
  },
  noHoverPointer: {
    '& :hover': {
      cursor: 'default',
    },
  },
  case_name: {
    color: `${theme.palette.secondary.main}`,
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  case_id: {
    fontSize: '1rem',
    fontWeight: 'normal',
    fontStyle: 'oblique',
  },
  caseIcon: {
    fontSize: '1.5rem',
    margin: '0 0.5rem 0 0',
    width: '2rem',
    height: '2rem',
  },
  titleellipsis: {
    position: 'absolute',
  },
}))

export function CaseTitle(props: Props) {
  const { caseInstance, limit, id } = props
  const classes = useStyles()
  const history = useHistory()
  const role = useSelector((state: AppState) => state.user.role) as AccountRole

  const toCase = () => {
    if (canAccessCase(role)) {
      history.push(`${CASE_URL}/${caseInstance?.id}/edit`)
    }
  }

  const name = caseInstance?.case_name ?? ''

  const caseName = typeof limit === 'undefined' ? name : clamp(name, limit)
  const hasPermission = canAccessCase(role)

  return (
    <>
      <Box
        display="flex"
        justifyContent="left"
        alignItems="center"
        onClick={toCase}
        className={clsx({
          [classes.hoverPointer]: hasPermission,
          [classes.noHoverPointer]: !hasPermission,
        })}
      >
        <BusinessCenterIcon className={classes.caseIcon} />
        {id ? (
          <Typography className={classes.case_name}>
            {caseName}
            <br />
            <span className={classes.case_id}>( Case ID: {caseInstance?.public_case_id})</span>
          </Typography>
        ) : (
          <Typography className={classes.case_name}>{caseName}</Typography>
        )}
      </Box>
    </>
  )
}
