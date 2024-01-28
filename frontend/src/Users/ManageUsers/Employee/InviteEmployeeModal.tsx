import { useState, useContext } from 'react'

/** Material UI */
import Modal from '@material-ui/core/Modal'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { ManageUsersContext } from 'Users/ManageUsers/ManageUsersProvider'

/** UI Components */
import InviteEmployeeForm from './InviteEmployeeForm'

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

export default function InviteEmployeeModal() {
  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle)
  const { manageUsers: data } = useContext(ManageUsersContext)

  const body = (
    <section style={modalStyle} className={classes.paper}>
      <InviteEmployeeForm />
    </section>
  )

  return (
    <div>
      <Modal
        open={data.employeeInviteModalOpen}
        onClose={() => (data.employeeInviteModalOpen = false)}
      >
        {body}
      </Modal>
    </div>
  )
}
