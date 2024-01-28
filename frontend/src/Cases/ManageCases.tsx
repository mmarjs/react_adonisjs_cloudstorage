import React, { useState, useEffect } from 'react'

/** Data */
import useCases from './useCases'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** UI */
import { Template } from 'UI'
import { CaseMenu } from './CaseMenu'
import { CaseCard } from './CaseCard'
import { CaseFilterItems } from './CaseFilterItems'
import { CaseTableView } from './CaseTableView'

/** Helpers */
import { useIsMounted } from 'Lib'
import { Case, AssignedUserCount } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '50px 0 0 0',
  },
  cardWrapper: {
    margin: '3rem 0',
  },
  noCasesFound: {
    fontWeight: 'bold',
  },
}))

const dataColumns = [
  {
    field: 'public_case_id',
    headerName: 'Case ID',
    flex: 0.1,
    type: 'string',
  },
  {
    field: 'case_name',
    headerName: 'Case Name',
    flex: 0.1,
    type: 'string',
  },
  {
    field: 'client_name',
    headerName: 'Client Name',
    width: 200,
    type: 'string',
  },
  {
    field: 'evidence_items',
    headerName: 'Evidence Items',
    width: 200,
    type: 'string',
  },
  {
    field: 'assigned_users',
    headerName: 'Assigned Users',
    width: 200,
    type: 'string',
  },
]

export function ManageCases() {
  const classes = useStyles()
  const { setSafely, isMounted } = useIsMounted()
  const { loadCases, cases, isLoading, isError, isSearchMode } = useCases()
  const showArchived = useSelector((state: AppState) => state.ui.showArchived)
  const [tableView, setTableView] = useState<boolean>(false)

  useEffect(() => {
    if (isMounted) {
      loadCases().then(() => {})
    }
  }, [isMounted])

  const handleChangeViewMode = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setSafely(setTableView, ev.target.checked)
  }

  // const handleChangeSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log(ev.target.value)
  //   if (ev.target.value === '') {
  //     setSearchMode(false)
  //   } else {
  //     const text = ev.target.value
  //     const params: CaseSearchParams = {
  //       type: 'simple',
  //       search: text,
  //       companyId: companyId,
  //       showArchived: showArchived,
  //     }
  //     console.log(params)
  //     search(params).then(() => {
  //       setSearchMode(true)
  //     })
  //   }
  // }

  // const handleClearSearch = () => {
  //   console.log('Clearing search')
  //   setSearchMode(false)
  // }

  return (
    <Template
      title="Manage Cases"
      isLoading={isLoading}
      isError={isError}
      errorMessage={'No cases could be fetched at this time'}
      FilterItems={CaseFilterItems}
      MenuItems={CaseMenu}
      onChangeViewMode={handleChangeViewMode}
      // onSimpleSearchChange={handleChangeSearch}
      // onSimpleClearSearch={handleClearSearch}
    >
      <Grid container justify="center" alignItems="center" spacing={2} className={classes.root}>
        {isSearchMode && (
          <ShowCases
            tableView={tableView}
            cases={cases.searchCases}
            assignedUserCount={cases.assignedUserCount}
          />
        )}
        {!isSearchMode && showArchived && (
          <ShowCases
            tableView={tableView}
            cases={cases.cases}
            assignedUserCount={cases.assignedUserCount}
          />
        )}

        {!isSearchMode && !showArchived && (
          <ShowCases
            tableView={tableView}
            cases={cases.activeCases}
            assignedUserCount={cases.assignedUserCount}
          />
        )}
      </Grid>
    </Template>
  )
}

interface ShowCasesProps {
  tableView: boolean
  cases: Case[]
  assignedUserCount: AssignedUserCount[]
}

function ShowCases(props: ShowCasesProps) {
  const classes = useStyles()
  const { tableView, cases, assignedUserCount } = props

  return (
    <>
      {tableView && <CaseTableView dataColumns={dataColumns} rowData={cases} />}
      {!tableView &&
        cases.length > 0 &&
        cases.map((item, i) => (
          <Grid item xs={4} key={i} className={classes.cardWrapper}>
            <CaseCard item={item} key={i} isHidden={true} assignedUserCount={assignedUserCount} />
          </Grid>
        ))}
      {!tableView && cases.length === 0 && (
        <Grid item xs={6}>
          <Alert severity="info" className={classes.noCasesFound}>
            No Cases Found
          </Alert>
        </Grid>
      )}
    </>
  )
}
