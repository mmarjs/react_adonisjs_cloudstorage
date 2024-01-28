import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { LOGIN_URL, useAxios, useOnce } from 'Lib'
import { AuthTemplate } from 'UI/Layout'

export function Logout() {
  const dispatch = useDispatch()
  const axios = useAxios()
  const history = useHistory()

  useOnce(() => {
    axios
      .post('/logout')
      .then(() => {
        dispatch({ type: 'RESET' })
        history.push(LOGIN_URL)
      })
      .catch(() => {})
  })()

  return (
    <>
      <AuthTemplate title="Logout">
        <></>
      </AuthTemplate>
    </>
  )
}
