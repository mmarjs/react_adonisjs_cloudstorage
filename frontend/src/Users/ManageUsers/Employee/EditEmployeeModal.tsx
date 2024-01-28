import { useState, useContext } from 'react'

/** Data */
import { ManageUsersContext } from 'Users/ManageUsers/ManageUsersProvider'

/** Material UI */
import Modal from '@material-ui/core/Modal'
import makeStyles from '@material-ui/core/styles/makeStyles'

/** UI Components */
import EditEmployeeForm from './EditEmployeeForm'

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

export default function EditEmployeeModal() {
  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle)
  const { manageUsers: data } = useContext(ManageUsersContext)

  const body = (
    <section style={modalStyle} className={classes.paper}>
      <EditEmployeeForm />
    </section>
  )

  return (
    <div>
      <Modal
        open={data.employeeEditModalOpen}
        onClose={() => {
          data.employeeEditModalOpen = false
        }}
      >
        {body}
      </Modal>
    </div>
  )
}
