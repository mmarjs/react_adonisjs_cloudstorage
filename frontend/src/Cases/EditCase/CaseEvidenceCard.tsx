import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/core/styles/makeStyles'
import NavigateNextSharpIcon from '@material-ui/icons/NavigateNextSharp'
import { ReactComponent as EvidenceLockerIcon } from 'Image/evidence_locker.svg'

interface Props {
  amount: number
}

export default function CaseEvidenceCard(props: Props) {
  const { amount } = props

  const useStyles = makeStyles((theme) => ({
    wrapper: {
      'height': '9rem',
      'width': '10rem',
      'backgroundColor': '#0D0D0D',
      'margin': '10px 0 2px 0',
      '& p': {
        color: '#ffffff',
      },
    },
    manageBar: {
      'height': '2rem',
      'width': '18rem',
      'padding': '0.25rem 0',
      'backgroundColor': 'rgba(13, 13, 13, .5)',
      '& p': {
        color: '#ffffff',
      },
      '& svg': {
        fill: '#ffffff',
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
    icon: {
      '& svg ': {
        fill: '#7F7F7F',
      },
    },
    lightBlackIcon: {
      '& path': {
        fill: '#7f7f7f !important',
      },
    },
    clickBox: {
      cursor: 'pointer',
    },
    gigabytes: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#fff',
    },
  }))

  const classes = useStyles()

  return (
    <>
      <Grid container>
        <Grid
          container
          item
          direction="row"
          justify="space-evenly"
          xs={12}
          className={classes.wrapper}
        >
          <Grid container item xs={6} justify="center" alignItems="center">
            <Grid item xs={12}>
              <Box pl={5}>
                <Typography display="block" className={classes.amount}>
                  {amount} <span className={classes.gigabytes}>GBs</span>
                </Typography>
                <Typography display="block" className={classes.amountDescription}>
                  Evidence
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={6}
            justify="center"
            alignItems="center"
            className={classes.lightBlackIcon}
          >
            <EvidenceLockerIcon className={classes.icon} height="50%" />
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
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              className={classes.clickBox}
              onClick={() => {}}
            >
              <Typography align="center">More Info</Typography>
              <NavigateNextSharpIcon style={{ color: '#344350' }} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
