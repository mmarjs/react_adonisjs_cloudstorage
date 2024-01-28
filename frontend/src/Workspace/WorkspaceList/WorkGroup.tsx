import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ExpandMore from '@material-ui/icons/KeyboardArrowRight'
import ExpandLess from '@material-ui/icons/KeyboardArrowDown'
import { ReactComponent as WorkspaceIcon } from 'Image/workspace.svg'
import { WorkspaceTree } from '../WorkspaceTree'
import { AppState } from 'App/reducers'
import { setCollapseOption, setSearchFlag } from 'Data/Workspace'
import { useHistory } from 'react-router-dom'
import { setTableViewMode } from 'Data/TableViewDataList'
import { WORKSPACE_URL } from 'Lib'
import { CollapseOption } from 'types'
import { WorkspaceGridContext, Store } from 'Workspace'
import { setSubBreadcrumb } from 'Data/Workspace'
import { setFieldNodeId } from 'Data/TableViewDataList'
import { useWorkspaceData } from '../useWorkspaceData'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  primaryIcon: {
    fill: '#5FB158',
    margin: '0 0 0 3px',
    width: '25px',
    height: '25px',
  },
  primaryText: {
    '& span': {
      'fontWeight': 'bold',
      'fontSize': '1rem',
      '&:hover': {
        color: '#5FB158',
      },
    },
  },
  primaryActiveText: {
    '& span': {
      fontWeight: 'bold',
      fontSize: '1rem',
      color: '#5FB158',
    },
  },
  listCollapse: {
    padding: '0 14px 0 45px',
  },
  listTitleIcon: {
    minWidth: '48px',
  },
  listIcon: {
    'minWidth': '20px',
    '& span': {
      padding: '0px',
    },
  },
  list: {
    '& li': {
      '&:hover': {
        color: '#5FB158',
      },
    },
    '& .MuiListItemSecondaryAction-root': {
      paddingRight: '10px',
    },
    '& .MuiListItemText-root': {
      cursor: 'pointer',
    },
  },
  activeList: {
    color: '#5FB158',
  },
  itemIcon: {
    color: '#767171',
    margin: '0 0 0 8px',
  },
  itemText: {
    fontStyle: 'italic',
    fontSize: '0.9rem',
  },
  divider: {
    height: '1px',
    margin: '15px 15px 0 15px',
    backgroundColor: '#5FB158',
  },
  checkBox: {
    '&$checked': {
      color: '#3D70B2',
    },
  },
  checked: {},
  listButton: {
    marginTop: '10px',
    padding: '0px 24px 0px 24px',
    zIndex: 999,
    backgroundColor: '#ffffff !important',
  },
  treeContainer: {
    zIndex: -1,
    marginTop: '-50px',
    marginLeft: '-38px',
  },
}))
interface WorkGroupProps {
  isMenuCollapse: boolean
}
export function WorkGroup(props: WorkGroupProps) {
  const { isMenuCollapse } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const { clearPagination } = useWorkspaceData()
  const collapseOption = useSelector((state: AppState) => state.workspaceData.collapseOption)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const { folderPath, setSearchMode, setSearchText } = useContext(WorkspaceGridContext) as Store

  const handleClick = () => {
    let optionList: CollapseOption = {
      workgroup: !collapseOption.workgroup,
      personal: false,
      share: false,
      recycle: false,
    }

    if (collapseOption.recycle) {
      dispatch(setTableViewMode(false))
      setTimeout(function () {
        dispatch(setTableViewMode(true))
      }, 10)
    }
    dispatch(setCollapseOption(optionList))
    if (folderPath.charAt(0) !== 'w') history.push(`${WORKSPACE_URL}/w/${currentCaseId}`)
  }

  const handleRootClick = () => {
    clearPagination()
    setSearchMode(false)
    dispatch(setSearchFlag(false))
    setSearchText('')
    history.push(`${WORKSPACE_URL}/w/${currentCaseId}`)
    dispatch(setFieldNodeId(0))
    dispatch(setSubBreadcrumb([]))
  }

  return (
    <List component="nav" className={classes.root}>
      <ListItem button className={classes.listButton}>
        <ListItemIcon className={classes.listTitleIcon} onClick={handleRootClick}>
          <WorkspaceIcon className={classes.primaryIcon} />
        </ListItemIcon>
        <ListItemText
          primary="Workgroup"
          className={collapseOption.workgroup ? classes.primaryActiveText : classes.primaryText}
          onClick={handleRootClick}
        />
        {collapseOption.workgroup ? (
          <ExpandLess onClick={handleClick} />
        ) : (
          <ExpandMore onClick={handleClick} />
        )}
      </ListItem>
      ​
      <Collapse
        in={collapseOption.workgroup && isMenuCollapse}
        timeout="auto"
        unmountOnExit
        className={classes.listCollapse}
      >
        <div className={classes.treeContainer}>{collapseOption.workgroup && <WorkspaceTree />}</div>
      </Collapse>
      {!collapseOption.workgroup && !collapseOption.personal && <WorkspaceTree />}
    </List>
  )
}
