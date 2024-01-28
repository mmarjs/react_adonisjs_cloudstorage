import { useState, useContext } from 'react'

/** Data */
import { ManageUsersContext } from 'Users/ManageUsers/ManageUsersProvider'

/** Material UI */
import Modal from '@material-ui/core/Modal'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** UI Components */
import InviteClientForm from './InviteClientForm'

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '50vw',
    minHeight: '40vh',
    borderRadius: '2rem',
    backgroundColor: theme.palette.background.paper,
  },
}))

export default function InviteClientModal() {
  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle)
  const { manageUsers: data } = useContext(ManageUsersContext)

  const body = (
    <section style={modalStyle} className={classes.paper}>
      <InviteClientForm />
    </section>
  )

  return (
    <div>
      <Modal
        open={data.clientInviteModalOpen}
        onClose={() => {
          data.clientInviteModalOpen = false
        }}
      >
        {body}
      </Modal>
    </div>
  )
}
