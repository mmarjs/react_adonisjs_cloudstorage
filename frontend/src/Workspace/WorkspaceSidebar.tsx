import { useState, useEffect, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

/** Data */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { useWorkspaceData } from './useWorkspaceData'
import { WorkspaceGridContext, Store } from 'Workspace'
import { setSubBreadcrumb, setCollapseOption } from 'Data/Workspace'
import { setSelectRowDetail, setFieldNodeId } from 'Data/TableViewDataList'

/** Material UI */
import Grid from '@material-ui/core/Grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { ReactComponent as ArrowLeftIcon } from 'Image/icon_colapse_left.svg'
import { ReactComponent as ArrowRightIcon } from 'Image/icon_colapse_right.svg'
import { ReactComponent as TrashIcon } from 'Image/icon_trash_delete.svg'
import { ViewerSidebarProps, CollapseOption } from 'types'

/** UI Components */
import { WorkGroup } from './WorkspaceList/WorkGroup'
import { PersonalGroup } from './WorkspaceList/PersonalGroup'

/** Helpers */
import { useIsMounted, WORKSPACE_URL } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  homeContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  homeIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#5FB158',
    padding: '5px',
    width: '60px',
  },
  homeIcon: {
    width: '30px',
    minWidth: '30px',
  },
  arrowIcon: {
    width: '25px',
    minWidth: '25px',
    cursor: 'pointer',
  },
  titleRow: {
    height: '40px',
    backgroundColor: '#5FB158',
    paddingRight: '5px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft: '8px',
  },
  sideBarMenu: {
    'minWidth': '240px',
    'height': 'calc(100% - 90px) !important',
    'overflowY': 'auto',
    'overflowX': 'hidden',
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
  wrapIcon: {
    position: 'absolute',
    verticalAlign: 'middle',
    display: 'inline-flex',
    padding: '0 24px',
    bottom: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#4472C4',
    fontStyle: 'italic',
  },
  trashIcon: {
    fill: '#4472C4',
    width: '20px',
    marginRight: '20px',
  },
  arrowIconButton: {
    padding: 0,
  },
}))

export function WorkspaceSidebar(props: ViewerSidebarProps) {
  const { isCollapse, handleCollapse } = props
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const dispatch = useDispatch()
  const history = useHistory()
  const { getFolderDataByPath, clearPagination } = useWorkspaceData()
  const [isMenuCollapse, setMenuCollapse] = useState<boolean>(true)
  const { setWorkspaceTableData, setRecycleBinParentIds } = useContext(
    WorkspaceGridContext
  ) as Store
  const role = useSelector((state: AppState) => state.user.role)

  let location = useLocation()
  useEffect(() => {
    let path = location.pathname
    path = path.substring(11, path.length)
    const lastChar = path.substr(path.length - 1)
    if (lastChar !== '/') path = path + '/'
    getFolderDataByPath(path)
    dispatch(setSelectRowDetail([]))
  }, [location])

  const onHandleCollapse = (val: boolean) => {
    handleCollapse(val)
    setSafely(setMenuCollapse, !val)
  }

  const onClickRecycleBin = () => {
    let optionList: CollapseOption = {
      workgroup: false,
      personal: false,
      share: false,
      recycle: true,
    }
    clearPagination()
    setRecycleBinParentIds([])
    setWorkspaceTableData([])
    dispatch(setFieldNodeId(0))
    dispatch(setSubBreadcrumb([]))
    dispatch(setSelectRowDetail([]))
    dispatch(setCollapseOption(optionList))
    history.push(`${WORKSPACE_URL}/r`)
  }

  return (
    <>
      <Grid item className={classes.root}>
        <Grid
          container
          justify={!isCollapse ? 'space-between' : 'center'}
          alignItems="center"
          className={classes.titleRow}
        >
          {!isCollapse && <Typography className={classes.title}>Workspace</Typography>}
          {!isCollapse && (
            <IconButton
              aria-label="ArrowBac"
              className={classes.arrowIconButton}
              onClick={(e) => onHandleCollapse(true)}
            >
              <ArrowLeftIcon className={classes.arrowIcon} />
            </IconButton>
          )}
          {isCollapse && (
            <IconButton
              aria-label="ArrowBac"
              className={classes.arrowIconButton}
              onClick={(e) => onHandleCollapse(false)}
            >
              <ArrowRightIcon className={classes.arrowIcon} />
            </IconButton>
          )}
        </Grid>
        <Grid item className={classes.sideBarMenu}>
          <WorkGroup isMenuCollapse={isMenuCollapse} />
          {!['client-user'].includes(role) && <PersonalGroup isMenuCollapse={isMenuCollapse} />}
        </Grid>
        <Typography
          variant="subtitle1"
          className={classes.wrapIcon}
          onClick={() => onClickRecycleBin()}
        >
          <TrashIcon className={classes.trashIcon} /> Recycle Bin
        </Typography>
      </Grid>
    </>
  )
}
