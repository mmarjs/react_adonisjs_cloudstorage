/** Data */
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'

/** Material UI */
import MenuItem from '@material-ui/core/MenuItem'

/** Helpers */
import { ADD_CASE_URL } from 'Lib'
import { ActionMenuItemsProps } from 'types'

export function CaseMenu(props: ActionMenuItemsProps) {
  const { navigate } = props
  const showArchived = useSelector((state: AppState) => state.ui.showArchived)
  const statusText = showArchived ? 'Hide Archived' : 'Show Archived'

  const handleNewCase = () => {
    navigate(ADD_CASE_URL)
  }

  const toggleArchived = () => {
    navigate('toggle-show-archived')
  }

  return (
    <>
      <MenuItem onClick={handleNewCase}>New Case</MenuItem>
      <MenuItem onClick={toggleArchived}>{statusText}</MenuItem>
    </>
  )
}
