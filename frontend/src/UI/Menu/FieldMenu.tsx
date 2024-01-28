import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import makeStyles from '@material-ui/core/styles/makeStyles'
import MenuItem from '@material-ui/core/MenuItem'
import { setFieldList } from 'Data/TableViewDataList'
import Switch from '@material-ui/core/Switch'
import Box from '@material-ui/core/Box'
import { AppState } from 'App/reducers'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  fieldMenuItem: {
    padding: '6px',
    height: '30px',
  },
  fieldList: {
    color: '#5FB158',
  },
}))

interface FieldMenuProps {
  fieldItemList: any[]
}

export function FieldMenu(props: FieldMenuProps) {
  const { fieldItemList } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const fieldList = useSelector((state: AppState) => state.tableViewData.fieldList)
  const [checked, setChecked] = useState<string[]>(fieldList.length > 0 ? fieldList : [])

  useEffect(() => {
    setChecked(fieldList)
  }, [fieldList])

  const handleToggle = (id: string) => () => {
    const currentIndex = checked.indexOf(id)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(id)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    dispatch(setFieldList(newChecked))
    setChecked(newChecked)
  }
  return (
    <>
      {fieldItemList?.map((data: any, index: any) => {
        return (
          <MenuItem key={index} className={classes.fieldMenuItem}>
            <Switch
              checked={checked.indexOf(data.field) === -1}
              onChange={handleToggle(data.field)}
              color="primary"
              name="checkedB"
              inputProps={{ 'aria-label': 'primary checkbox' }}
              size="small"
            />
            <Box component="span" className={classes.fieldList}>
              {data.headerName}
            </Box>
          </MenuItem>
        )
      })}
    </>
  )
}
