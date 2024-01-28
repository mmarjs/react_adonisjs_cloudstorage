import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import LaunchIcon from '@material-ui/icons/Launch'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { DetailModal } from './DetailModal'
import Collapse from '@material-ui/core/Collapse'
import { useIsMounted } from 'Lib'

const useStyles = makeStyles((theme) => ({
  titleRow: {
    height: '30px',
    backgroundColor: '#5FB158',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  previewContent: {
    height: '100px',
  },
  arrowIconButton: {
    padding: '0 5px',
  },
}))

export function WorkspacePreview() {
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const [isPreviewRightCollapse, setIsPreviewRightCollapse] = useState<boolean>(true)
  const [isExpandModal, setIsExpandModal] = useState<boolean>(false)
  const handleSetPreviewExpandModal = (open: boolean) => {
    setSafely(setIsExpandModal, open)
  }

  return (
    <>
      <Grid container>
        <Grid container justify="space-between" alignItems="center" className={classes.titleRow}>
          <Grid item>
            <IconButton
              aria-label="Launch"
              className={classes.arrowIconButton}
              onClick={(e) => handleSetPreviewExpandModal(!isExpandModal)}
            >
              <LaunchIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography className={classes.title}>Preview</Typography>
          </Grid>
          <Grid item>
            {isPreviewRightCollapse && (
              <IconButton
                aria-label="ArrowUp"
                className={classes.arrowIconButton}
                onClick={(e) => setSafely(setIsPreviewRightCollapse, false)}
              >
                <ExpandLessIcon />
              </IconButton>
            )}
            {!isPreviewRightCollapse && (
              <IconButton
                aria-label="ArrowDown"
                className={classes.arrowIconButton}
                onClick={(e) => setSafely(setIsPreviewRightCollapse, true)}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Collapse in={isPreviewRightCollapse} timeout="auto" unmountOnExit>
          <Grid item className={classes.previewContent}>
            123123123
          </Grid>
        </Collapse>
      </Grid>
      <DetailModal
        isOpen={isExpandModal}
        handleOpen={handleSetPreviewExpandModal}
        detailData={{
          title: 'Preview',
          data: 'Preview Detail Modal. Let Google help apps determine location.',
        }}
      />
    </>
  )
}
