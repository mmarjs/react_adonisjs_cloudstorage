import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Menu from '@material-ui/core/Menu'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import { ReactComponent as LaunchIcon } from 'Image/icon_view_full_screen.svg'
import { useIsMounted } from 'Lib'
import { FieldMenuProps } from 'types'
import Button from '@material-ui/core/Button'
import { setFieldList } from 'Data/TableViewDataList'

const useStyles = makeStyles((theme) => ({
  icon: {
    margin: '0',
    fontSize: '2rem',
  },
  toolBarIcon: {
    cursor: 'pointer',
    width: '20px',
  },
  fieldItemMenu: {
    '& div': {
      width: '200px',
    },
  },
  fieldName: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  findColumn: {
    padding: '0 12px',
  },
}))

export function FieldListMenu(props: FieldMenuProps) {
  const { FieldItems, fieldItemList } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const { setSafely } = useIsMounted()
  const [fieldItemListData, setItemList] = useState<any>(fieldItemList ? fieldItemList : [])
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  useEffect(() => {
    setItemList(fieldItemList)
  }, [fieldItemList])

  const openMenu = (event: React.SyntheticEvent<SVGSVGElement>) => {
    setSafely(setAnchorEl, event.currentTarget)
  }

  const closeMenu = () => {
    setSafely(setAnchorEl, null)
  }

  const onChangeshowColumn = (mode: string) => {
    let tem_list: any = []
    if (mode === 'show') {
      dispatch(setFieldList([]))
    } else {
      fieldItemList.map((ele, index) => {
        tem_list.push(ele['field'])
        return ele
      })
      dispatch(setFieldList(tem_list))
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filteredItem = fieldItemList.filter((item: any) => {
      return item['headerName'].toLowerCase().match(event.target.value.toLowerCase())
    })
    setItemList(filteredItem)
  }

  return (
    <>
      <Box display="flex" alignItems="center">
        <LaunchIcon className={classes.toolBarIcon} onClick={openMenu} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Grid item className={classes.findColumn}>
          <TextField id="standard-basic" label="Find column" onChange={handleChange} />
        </Grid>
        <div>
          <FieldItems fieldItemList={fieldItemListData} />
        </div>
        <Grid container item justify="space-between" className={classes.findColumn}>
          <Button color="primary" size="small" onClick={() => onChangeshowColumn('hide')}>
            HIDE ALL
          </Button>
          <Button color="primary" size="small" onClick={() => onChangeshowColumn('show')}>
            SHOW ALL
          </Button>
        </Grid>
      </Menu>
    </>
  )
}
