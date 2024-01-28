import React from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import Typography from '@material-ui/core/Typography'
import { Upload } from 'Upload/Upload'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Box from '@material-ui/core/Box'
import useValidUntil from '../useValidUntil'
import { UploadProvider } from 'Upload/UploadProvider'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '70vw',
    height: '70vh',
  },
  paper: {
    width: '100%',
    height: '100%',
    padding: '1rem',
    borderRadius: '25px',
  },
}))

export function ShareUpload() {
  const classes = useStyles()
  const validUntil = useValidUntil()
  const shareLink = useSelector((state: AppState) => state.share.shareLink)
  const filenames = ['foo.png']

  return (
    <>
      <Grid container justify="center" alignItems="center">
        <Grid item xs={12} className={classes.root}>
          <Grid item justify="center">
            <Typography variant="h1" align="center">
              <strong>Secure Upload Access</strong>
            </Typography>
            <Box my={2}>
              <Typography align="center" color="primary">
                VALID TILL: {validUntil.toUpperCase()}
              </Typography>
            </Box>
          </Grid>

          <UploadProvider>
            <Upload
              category={shareLink.resource === 'work_group' ? 'workgroup' : 'personal'}
              categoryId={shareLink.resource_id}
              folderId={shareLink.folder_id}
              filenames={filenames}
              shareLinkId={shareLink.id}
              display="inline"
              trigger="#upload"
            />
          </UploadProvider>
        </Grid>
      </Grid>
    </>
  )
}
