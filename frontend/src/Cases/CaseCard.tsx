import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import CaseCardShield from './CaseCardShield'
import { CaseTitle } from 'Cases'
import { ReactComponent as AnalyzeIcon } from 'Image/analyze.svg'
import { ReactComponent as WorkspaceIcon } from 'Image/workspace.svg'
import { AccountRole, AssignedUserCount, Case } from 'types'
import { AppState } from 'App/reducers'
import { setCaseId, setCollapseOption } from 'Data/Workspace'
import { setFieldNodeId } from 'Data/TableViewDataList'
import clsx from 'clsx'
import { clamp, SELECT_EVIDENCE_URL, WORKSPACE_URL, ASSIGNED_USERS, canAccessCase } from 'Lib'
import find from 'lodash-es/find'

interface Props {
  item: Case
  isHidden: boolean
  assignedUserCount: AssignedUserCount[]
}

export function CaseCard(props: Props) {
  const { item, isHidden, assignedUserCount } = props
  const dispatch = useDispatch()
  const role = useSelector((state: AppState) => state.user.role) as AccountRole
  const history = useHistory()

  const useStyles = makeStyles((theme) => ({
    root: {
      'display': 'grid',
      'grid-template-columns': '1fr 0.5fr',
      'grid-template-rows': '4rem 1fr 1fr',
      'gap': '0px 0px',
      'grid-template-areas': `
      "popup caseid"
      "case case"
      "count info"
        `,
      'height': '210px',
      'minWidth': '300px',
      'maxWidth': '437.5px',
      'color': 'rgba(0, 0, 0, 0.87)',
      'transition': 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      'backgroundColor': '#fff',
      'borderRadius': '8px',
      'boxShadow':
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
      'padding': '1rem',
      'margin': 'auto',
    },
    popup: {
      'grid-area': 'popup',
      'position': 'relative',
      'top': '-65px',
    },
    caseid: {
      'grid-area': 'caseid',
    },
    case: {
      'grid-area': 'case',
      'margin': '-20px 0 10px 0',
    },
    count: {
      'grid-area': 'count',
      'alignSelf': 'center',
    },
    info: {
      'grid-area': 'info',
      'alignSelf': 'flex-end',
      'display': 'flex',
      'justifyContent': 'space-between',
      'justifyItems': 'center',
    },
    infoHidden: {
      'grid-area': 'info',
      'alignSelf': 'flex-end',
      'display': 'flex',
      'justifyContent': 'flex-end',
      'justifyItems': 'center',
    },
    iconBox: {
      width: '2.7rem',
      height: '2.7rem',
      padding: '6px',
      borderRadius: '5px',
      backgroundColor: `${theme.palette.primary.main}`,
      cursor: 'pointer',
    },
    inactiveBox: {
      width: '2.7rem',
      height: '2.7rem',
      padding: '6px',
      borderRadius: '5px',
      backgroundColor: '#7F7F7F',
      pointerEvents: 'none',
    },
    icon: {
      'height': 'auto',
      '& > *': {
        fill: '#fff',
      },
    },
    hr: {
      margin: '2px 0 5px 0',
    },
    publicCaseId: {
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: '0.8rem',
      color: '#000',
    },
    counterText: {
      fontSize: '0.8rem',
      color: '#000',
    },
    linkCounterText: {
      fontSize: '0.8rem',
      color: '#5FB158',
    },
    inactiveLinkCounterText: {
      fontSize: '0.8rem',
      color: '#000000',
    },
  }))

  const classes = useStyles()

  const toWorkspaceUrl = () => {
    let optionList: any = {
      workgroup: true,
      personal: false,
      share: false,
    }
    dispatch(setCollapseOption(optionList))
    dispatch(setFieldNodeId(0))
    dispatch(setCaseId(item?.id))
    history.push(`${WORKSPACE_URL}/w/${item?.id}`)
  }

  const toEvidenceUrl = () => {
    if (canAccessCase(role)) {
      history.push(`${SELECT_EVIDENCE_URL}/${item?.id}`)
    }
  }

  const showAssignedUserCount = (caseId: number) => {
    const number = find(assignedUserCount, { caseId: item?.id })
    return number?.userNumber ?? 0
  }

  return (
    <>
      <div className={classes.root}>
        <div className={classes.popup}>
          <CaseCardShield item={item} id />
        </div>
        <div className={classes.caseid}>
          <Typography align="right" className={classes.publicCaseId}>
            Case ID: {item.public_case_id}
          </Typography>
        </div>

        <div className={classes.case}>
          <CaseTitle caseInstance={item} limit={26} id={false} />
          <hr className={classes.hr} />
          <Typography display="block" style={{ color: '#000', fontSize: '1rem' }}>
            Client Name: <strong>{clamp(item.client_name, 21)}</strong>
          </Typography>
        </div>

        <div className={classes.count}>
          <Typography display="block" className={classes.counterText}>
            Evidence Items: 0
          </Typography>
          {item.status === 'active' && canAccessCase(role) ? (
            <Link to={`${ASSIGNED_USERS}/${item?.id}`}>
              <Typography display="block" className={classes.linkCounterText}>
                Assigned Users: {showAssignedUserCount(item?.id)}
              </Typography>
            </Link>
          ) : (
            <Typography display="block" className={classes.inactiveLinkCounterText}>
              Assigned Users: {showAssignedUserCount(item?.id)}
            </Typography>
          )}
        </div>
        <div
          className={clsx({
            [classes.info]: !isHidden,
            [classes.infoHidden]: isHidden,
          })}
        >
          {role === 'case-manager' || role === 'client-user' ? (
            <div
              className={clsx({
                [classes.iconBox]: item.status === 'active',
                [classes.inactiveBox]: item.status !== 'active',
              })}
              onClick={toWorkspaceUrl}
            >
              <WorkspaceIcon className={classes.icon} />
            </div>
          ) : (
            <>
              <div
                className={clsx({
                  [classes.iconBox]: item.status === 'active',
                  [classes.inactiveBox]: item.status !== 'active',
                })}
                onClick={toWorkspaceUrl}
              >
                <WorkspaceIcon className={classes.icon} />
              </div>
              {!isHidden && (
                <>
                  <div
                    className={clsx({
                      [classes.iconBox]: item.status === 'active',
                      [classes.inactiveBox]: item.status !== 'active',
                    })}
                    onClick={toEvidenceUrl}
                  >
                    <AnalyzeIcon className={classes.icon} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
