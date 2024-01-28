import React from 'react'
import { GridPagination } from '@material-ui/x-grid'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { FooterStatuItemProps } from './types'
import { displayFileSize } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRowCount: {
    marginLeft: '20px',
  },
}))

export function FooterStatus(props: FooterStatuItemProps) {
  const classes = useStyles()
  const { selectedRows, sizeMode } = props
  const sum = selectedRows.reduce((partial_sum, a) => partial_sum + a.size, 0)

  return (
    <div className={classes.root}>
      {selectedRows.length > 0 ? (
        <div className={classes.selectedRowCount}>
          {`${selectedRows.length} item selected `}
          {sizeMode ? `(${displayFileSize(sum)})` : ''}
        </div>
      ) : (
        <div></div>
      )}

      <GridPagination></GridPagination>
    </div>
  )
}
