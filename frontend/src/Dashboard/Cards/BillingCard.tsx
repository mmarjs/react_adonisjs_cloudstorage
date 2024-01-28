import React from 'react'
import { useHistory } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/core/styles/makeStyles'
import NavigateNextSharpIcon from '@material-ui/icons/NavigateNextSharp'
import { ReactComponent as DollarIcon } from 'Image/amount.svg'
import { ACCOUNT_BILLING_URL } from 'Lib'

interface Props {
  amount: number
}

export default function BillingCard(props: Props) {
  const { amount } = props
  const history = useHistory()

  const to = () => {
    history.push(ACCOUNT_BILLING_URL)
  }

  const useStyles = makeStyles((theme) => ({
    wrapper: {
      'height': '352px',
      'width': '18rem',
      'backgroundColor': '#ffffff',
      'margin': '0 0 0.25rem 0',
      'border': '1px solid #7EA05A',
      '& p': {
        color: '#7EA05A',
      },
      // [theme.breakpoints.up('md')]: {
      //   height: '20rem',
      //   width: '15rem',
      //   margin: '0 0.25rem 0',
      // },
      // [theme.breakpoints.up('xs')]: {
      //   height: '15rem',
      //   width: '10rem',
      //   margin: '0 0.25rem 0',
      // },
    },
    manageBar: {
      'height': '35px',
      'width': '18rem',
      'padding': '0.25rem 0',
      'backgroundColor': '#A2CA87',
      '& p': {
        color: '#70AE46',
      },
      '& :hover': {
        cursor: 'pointer',
      },
    },
    amount: {
      fontSize: '3rem',
      fontWeight: 700,
      color: '#7EA05A',
    },
    amountDescription: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#7EA05A',
    },
    dollarIcon: {
      'height': '8rem',
      '& path': {
        fill: `${theme.palette.primary.main}`,
      },
      [theme.breakpoints.up('md')]: {
        height: '7rem',
      },
      [theme.breakpoints.up('xs')]: {
        height: '5rem',
      },
    },
  }))

  const classes = useStyles()

  return (
    <>
      <Grid container>
        <Grid
          container
          item
          direction="column"
          justify="space-evenly"
          xs={12}
          className={classes.wrapper}
        >
          <Grid container item xs={12} justify="center" alignItems="center">
            <Grid item xs={12}>
              <Box m={1} textAlign="center">
                <DollarIcon className={classes.dollarIcon} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography display="block" align="center" className={classes.amount}>
                {amount}
              </Typography>
              <Typography display="block" align="center" className={classes.amountDescription}>
                Current Month
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          container
          item
          xs={12}
          className={classes.manageBar}
          direction="row"
          justify="center"
          alignItems="flex-end"
        >
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" onClick={to}>
              <Typography align="center" style={{ color: '#000000' }}>
                Report
              </Typography>
              <NavigateNextSharpIcon style={{ color: '#344350' }} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
