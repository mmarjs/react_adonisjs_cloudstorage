import { useHistory } from 'react-router-dom'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { LOGOUT_URL } from 'Lib'
import useAuthToken from 'Auth/useAuthToken'

export function useAxios(timeout: number = 5000) {
  const history = useHistory()
  const apiUrl = process.env.REACT_APP_API

  const { token, refresh } = useAuthToken()

  const config = {
    baseURL: apiUrl,
    timeout: timeout,
    headers: {
      token: token,
    },
  }

  const axiosInstance = axios.create(config)

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (token !== 'no-token-present') {
        refresh()
      }
      return response
    },
    (error: AxiosError) => {
      const status = error.response?.status

      if (status) {
        if (status >= 400 && status <= 500) {
          if (status === 401) {
            history.push(LOGOUT_URL)
          }
          if (status === 422) {
            return Promise.reject(error.response?.data)
          }
          return Promise.reject(error)
        }
      } else {
        return Promise.reject(error)
      }
    }
  )

  return axiosInstance
}
