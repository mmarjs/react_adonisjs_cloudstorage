import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { DetailModalProps } from 'types'

export function DetailModal(props: DetailModalProps) {
  const { isOpen, handleOpen, detailData } = props
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={(e) => handleOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{detailData.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{detailData.data}</DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  )
}
