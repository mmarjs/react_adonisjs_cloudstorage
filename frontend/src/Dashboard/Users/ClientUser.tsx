import { useContext } from 'react'

/** Data */
import { DashboardContext } from 'Dashboard/DashboardProvider'

/** Material UI */
import Grid from '@material-ui/core/Grid'

/** UI */
import DashboardCard from 'Dashboard/Cards/DashboardCard'

import { displayGigCount } from 'Lib'

export function ClientUser() {
  const { data } = useContext(DashboardContext)

  const getCount = (count: number, type: string) => {
    let amount: number = 0
    let unit = ''
    if (type === 'unit') {
      amount = Number(displayGigCount(count)[0])
      unit = displayGigCount(count)[1]
    } else {
      amount = count
      unit = ''
    }
    return { amount, unit }
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item sm={3} xs={12}>
          <DashboardCard type="Cases" amount={getCount(data.dashboard.caseCount, '')} />
        </Grid>
        <Grid item sm={3} xs={12}>
          <DashboardCard type="Custodians" amount={getCount(data.dashboard.custodianCount, '')} />
        </Grid>
        <Grid item sm={3} xs={12}>
          <DashboardCard type="Acquisitions" amount={getCount(data.dashboard.requestCount, '')} />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item sm={3} xs={12}>
          <DashboardCard
            type="ActiveLocker"
            amount={getCount(data.dashboard.activeLockerCount, 'unit')}
          />
        </Grid>
        <Grid item sm={3} xs={12}>
          <DashboardCard
            type="ArchiveLocker"
            amount={getCount(data.dashboard.archiveLockerCount, 'unit')}
          />
        </Grid>
      </Grid>
    </>
  )
}
