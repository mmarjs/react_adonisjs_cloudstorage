import React, { useState, useContext } from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import IconButton from '@material-ui/core/IconButton'
import Collapse from '@material-ui/core/Collapse'
import Box from '@material-ui/core/Box'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import { ReactComponent as ArrowRightIcon } from 'Image/icon_colapse_right.svg'
import { ViewerDetailProps } from 'types'
import { AppState } from 'App/reducers'
import { useIsMounted } from 'Lib'
import { WorkspacePreview } from './WorkspacePreview'
import { WorkspaceNotes } from './WorkspaceNotes'
import { FieldCells } from './DumyData'
import { WorkspaceGridContext, Store } from 'Workspace'
import { displayFileSize } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  titleRow: {
    height: '40px',
    backgroundColor: '#5FB158',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft: '8px',
  },
  collapseIcon: {
    width: '20px',
  },
  detailContent: {
    color: '#000',
  },
  detailList: {
    color: '#000',
    fontSize: '0.8rem',
    padding: '3px 10px',
  },
  detailListTitle: {
    textAlign: 'right',
  },
  detailListContent: {
    textAlign: 'left',
    paddingLeft: '20px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  previewNoteWrapper: {
    width: '100%',
  },
  previewNote: {
    margin: '10px',
    border: '1px solid #5FB158',
  },
  detailContainer: {
    'overflowY': 'auto',
    'height': 'calc(100% - 50px) !important',
    'width': '100%',
    'direction': 'rtl',
    '&::-webkit-scrollbar-track': {
      borderRadius: '10px',
      backgroundColor: '#dbefda',
    },
    '&::-webkit-scrollbar': {
      width: '7px',
      backgroundColor: '#F5F5F5',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '10px',
      backgroundColor: '#5FB158',
    },
  },
  detailWrapper: {
    direction: 'ltr',
  },
  arrowIconButton: {
    padding: '0 5px',
  },
}))

export function WorkspaceDetail(props: ViewerDetailProps) {
  const { handleDetailCollapse } = props
  const { setSafely } = useIsMounted()
  const [isDetailCollapse, setIsDetailCollapse] = useState(false)
  const [columnsData, setColumnData] = useState<any[]>([])
  const detailData = useSelector((state: AppState) => state.tableViewData.selectRowDetail)
  const classes = useStyles()
  const { folderPath, searchMode } = useContext(WorkspaceGridContext) as Store

  const handleIsDetailCollapse = (value: boolean) => {
    setSafely(setIsDetailCollapse, value)
  }

  React.useMemo(() => {
    let fieldListData: any = []
    if (searchMode) {
      fieldListData = FieldCells.find((item) => item.type === 'search')
    } else if (folderPath.charAt(0) === 'w') {
      fieldListData = FieldCells.find((item) => item.type === 'workgroup')
    } else if (folderPath.charAt(0) === 'p') {
      fieldListData = FieldCells.find((item) => item.type === 'personal')
    } else if (folderPath.charAt(0) === 'r') {
      fieldListData = FieldCells.find((item) => item.type === 'recycle')
    } else if (folderPath.charAt(0) === 's') {
      fieldListData = FieldCells.find((item) => item.type === 'share')
    }
    setColumnData(fieldListData.fieldList)
  }, [searchMode, folderPath, setColumnData])

  return (
    <>
      <Grid container className={classes.root}>
        <Grid container justify="space-between" alignItems="center" className={classes.titleRow}>
          <Grid item>
            <IconButton
              aria-label="ArrowForward"
              className={classes.arrowIconButton}
              onClick={(e) => handleDetailCollapse(true)}
            >
              <ArrowRightIcon className={classes.collapseIcon} />
            </IconButton>
            <Box component="span" className={classes.title}>
              Details
            </Box>
          </Grid>
          <Grid item>
            {!isDetailCollapse && (
              <IconButton
                aria-label="ArrowDown"
                className={classes.arrowIconButton}
                onClick={(e) => handleIsDetailCollapse(true)}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
            {isDetailCollapse && (
              <IconButton
                aria-label="ArrowDown"
                className={classes.arrowIconButton}
                onClick={(e) => handleIsDetailCollapse(false)}
              >
                <ExpandLessIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Grid item className={classes.detailContainer}>
          <Grid item className={classes.detailWrapper}>
            <Grid item xs={12}>
              <Collapse in={isDetailCollapse} timeout="auto" unmountOnExit>
                <List>
                  {detailData &&
                    columnsData.map((el: any, index: number) => {
                      if (el.field !== 'icon') {
                        return (
                          <ListItem key={index} className={classes.detailList}>
                            <Grid item xs={5} className={classes.detailListTitle}>
                              {el.headerName}
                            </Grid>
                            <Grid
                              item
                              title={detailData[el.field]}
                              xs={7}
                              className={classes.detailListContent}
                            >
                              {el.field === 'size'
                                ? displayFileSize(detailData[el.field])
                                : detailData[el.field]}
                            </Grid>
                          </ListItem>
                        )
                      } else {
                        return <></>
                      }
                    })}
                </List>
              </Collapse>
            </Grid>
            <Grid item className={classes.previewNoteWrapper}>
              <Box key={'preview'} className={classes.previewNote}>
                <WorkspacePreview />
              </Box>
              <Box key={'note'} className={classes.previewNote}>
                <WorkspaceNotes />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
