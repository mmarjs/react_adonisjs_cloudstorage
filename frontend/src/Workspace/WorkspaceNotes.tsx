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
  homeIcon: {
    backgroundColor: '#5FB158',
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
  },
  titleRow: {
    height: '30px',
    backgroundColor: '#5FB158',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  noteContent: {
    height: '100px',
  },
  arrowIconButton: {
    padding: '0 5px',
  },
}))

export function WorkspaceNotes() {
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const [isNoteRightCollapse, setIsNoteRightCollapse] = useState<boolean>(true)
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
            <Typography className={classes.title}>Tags & Notes</Typography>
          </Grid>
          <Grid item>
            {isNoteRightCollapse && (
              <IconButton
                aria-label="ArrowUp"
                className={classes.arrowIconButton}
                onClick={(e) => setSafely(setIsNoteRightCollapse, false)}
              >
                <ExpandLessIcon />
              </IconButton>
            )}
            {!isNoteRightCollapse && (
              <IconButton
                aria-label="ArrowDown"
                className={classes.arrowIconButton}
                onClick={(e) => setSafely(setIsNoteRightCollapse, true)}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Collapse in={isNoteRightCollapse} timeout="auto" unmountOnExit>
          <Grid item className={classes.noteContent}>
            123123123
          </Grid>
        </Collapse>
      </Grid>
      <DetailModal
        isOpen={isExpandModal}
        handleOpen={handleSetPreviewExpandModal}
        detailData={{
          title: 'Tags & Notes',
          data: 'Tags & Notes Detail Modal. Let Google help apps determine location.',
        }}
      />
    </>
  )
}
