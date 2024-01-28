import React, { useState, useEffect } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Alert from '@material-ui/lab/Alert'
import { RenameModalProps } from 'types'
import { useIsMounted } from 'Lib'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  messageTitle: {
    margin: 'auto',
    width: '80%',
  },
}))

export function WorkspaceRenameForm(props: RenameModalProps) {
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const { open, onSetCreateName, onSetRenameName, onCloseModal, currentName, isAddFolder } = props
  const [newName, setName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (!isAddFolder) {
      setName(currentName)
    } else {
      setName('')
    }
  }, [currentName, isAddFolder, open])

  const handleClickSave = () => {
    if (newName === '') {
      setSafely(setErrorMessage, 'A name is required')
      return
    }
    if (!isAddFolder) {
      onSetRenameName(newName)
    } else {
      onSetCreateName(newName)
    }
    setErrorMessage('')
  }

  const handleClose = () => {
    setErrorMessage('')
    onCloseModal()
  }

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSafely(setName, event.target.value)
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth={'sm'}
      >
        <DialogTitle id="form-dialog-title">Please enter the name!</DialogTitle>
        {errorMessage !== '' && errorMessage !== undefined && (
          <Alert
            severity="error"
            className={classes.messageTitle}
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="New name"
            type="text"
            fullWidth
            value={newName}
            onChange={handleChangeName}
            onKeyPress={(event) => {
              if (event.keyCode === 13 || event.key === 'Enter') {
                handleClickSave()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClickSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
