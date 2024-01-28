import { useState, useRef, useContext } from 'react'
import Axios, { AxiosResponse, AxiosError } from 'axios'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setLogin, refreshTimestamp } from 'Data/Auth'
import { setUser, setRole } from 'Data/User'
import { setCompany } from 'Data/Company'
import { setHasMultiple } from 'Data/Company'
import { setNotifications } from 'Data/Notifications'
import { setNotificationSettings } from 'Data/NotificationSettings'
import { setPermissions } from 'Data/Permissions'
import { LogRocketContext } from 'Lib/LogRocketProvider'
import { errorMessage } from './utils'
import { HOME_URL, useIsMounted, isProduction } from 'Lib'
import {
  ValidateLoginParams,
  ValidateLoginResponse,
  NeedTwoFactorParams,
  NeedTwoFactorResponse,
  VerifyTwoFactorParams,
  FetchLoginDataParams,
  FetchLoginDataResponse,
  LoginAction,
  RoleCompany,
} from 'types'

export default function useLogin() {
  const axios = Axios.create({
    baseURL: process.env.REACT_APP_API,
  })
  const dispatch = useDispatch()
  const history = useHistory()
  const { setSafely } = useIsMounted()
  const logrocket = useContext(LogRocketContext)
  const [action, setAction] = useState<LoginAction>('validate-login')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectCompany, setSelectCompany] = useState<boolean>(false)
  const loginProcessToken = useRef<string>('')
  const userId = useRef<number>(0)
  const companies = useRef<RoleCompany[]>([])
  const selectedCompany = useRef<RoleCompany | undefined>()

  const storeErrorMessage = (error: { error: string }) => {
    const message = errorMessage(error?.error)

    setSafely(setError, message)
  }

  const storeLoading = (val: boolean) => {
    setSafely(setIsLoading, val)
  }

  const storeAction = (val: LoginAction) => {
    setSafely(setAction, val)
  }

  const storeLoginProcessToken = (token: string) => {
    loginProcessToken.current = token
  }

  const storeUserId = (val: number) => {
    userId.current = val
  }

  const storeCompanies = (data: RoleCompany[]) => {
    companies.current = data
  }

  const storeSelectCompany = (val: boolean) => {
    setSafely(setSelectCompany, val)
  }

  const storeSelectedCompany = (company: RoleCompany) => {
    selectedCompany.current = company
  }

  const storeLoginData = (loginData: FetchLoginDataResponse) => {
    dispatch(setLogin(loginData.token))
    dispatch(refreshTimestamp(''))
    dispatch(setUser(loginData.user))
    dispatch(setRole(loginData.role))
    dispatch(setCompany(loginData.company))
    dispatch(setHasMultiple(loginData.hasMultipleCompanies))
    dispatch(setNotifications(loginData.notifications))
    dispatch(setNotificationSettings(loginData.notificationSettings))
    dispatch(setPermissions(loginData.permissions))
  }

  const processValidateLogin = (params: ValidateLoginParams) => {
    storeLoading(true)

    axios
      .post('/login', params)
      .then((res: AxiosResponse) => {
        const { companies, loginProcessToken, userId } = res.data as ValidateLoginResponse

        storeCompanies(companies)
        storeUserId(userId)
        storeLoginProcessToken(loginProcessToken)
        storeAction('need-two-factor')

        if (companies.length === 1) {
          storeSelectedCompany(companies[0])
        }

        if (companies.length > 1) {
          storeSelectCompany(true)
          storeLoading(false)
          return true
        }

        processNeedTwoFactor(companies[0].id)
        return
      })
      .catch((err: AxiosError) => {
        storeErrorMessage(err.response?.data)
        storeLoading(false)
      })
  }

  const processNeedTwoFactor = (companyId: number) => {
    const params: NeedTwoFactorParams = {
      action: 'need-two-factor',
      loginProcessToken: loginProcessToken.current,
      userId: userId.current,
      companyId,
    }

    storeLoading(true)

    axios
      .post('/login', params)
      .then((res: AxiosResponse) => {
        const { status } = res.data as NeedTwoFactorResponse
        if (status) {
          storeAction('verify-two-factor')
          storeLoading(false)
          return true
        } else {
          processFetchLoginData({
            action: 'fetch-login-data',
            userId: params.userId,
            companyId: params.companyId,
            loginProcessToken: params.loginProcessToken,
          })
        }
      })
      .catch((err: AxiosError) => {
        storeErrorMessage(err.response?.data)
        storeLoading(false)
      })
  }

  const processVerifyTwoFactor = (twoFactorToken: string) => {
    const params: VerifyTwoFactorParams = {
      action: 'verify-two-factor',
      userId: userId.current,
      companyId: selectedCompany.current?.id as number,
      loginProcessToken: loginProcessToken.current,
      twoFactorToken,
    }

    storeLoading(true)

    axios
      .post('/login', params)
      .then(() => {
        processFetchLoginData({
          action: 'fetch-login-data',
          userId: params.userId,
          companyId: params.companyId,
          loginProcessToken: params.loginProcessToken,
        })
      })
      .catch((err: AxiosError) => {
        storeErrorMessage(err.response?.data)
        storeLoading(false)
      })
  }

  const processFetchLoginData = (params: FetchLoginDataParams) => {
    storeLoading(true)
    axios
      .post('/login', params)
      .then((res: AxiosResponse) => {
        const data = res.data as FetchLoginDataResponse
        storeLoginData(data)

        if (isProduction) {
          logrocket?.identify(`user-${data.user.id}`, {
            name: `${data.user.first_name} ${data.user.last_name}`,
            email: `${data.user.email}`,
          })
        }

        history.push(HOME_URL)
      })
      .catch((err: AxiosError) => {
        storeErrorMessage(err.response?.data)
        storeLoading(false)
      })
  }

  return {
    action,
    error,
    isLoading,
    selectCompany,
    storeSelectedCompany,
    companies,
    processValidateLogin,
    processNeedTwoFactor,
    processVerifyTwoFactor,
    storeLoginData,
  }
}
