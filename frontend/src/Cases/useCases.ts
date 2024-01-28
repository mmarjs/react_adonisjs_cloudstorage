import { useContext, useRef, useState } from 'react'

/** Data */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { StatusContext } from 'App/StatusProvider'
import {
  setCases,
  setActiveCases,
  setSearchCases,
  setTotalFileSizeByCase,
  setAssignedUserCount,
} from 'Data/Cases'

/** Helpers */
import { useAxios, useIsMounted } from 'Lib'
import { ManageCasesResponse, CaseSearchParams, Case } from 'types'

export default function useCases() {
  const axios = useAxios()
  const { setSafely } = useIsMounted()
  const { showStatus } = useContext(StatusContext)
  const dispatch = useDispatch()
  const hasRun = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const cases = useSelector((state: AppState) => state.cases)
  const companyId = useSelector((state: AppState) => state.company.id)

  async function loadCases() {
    try {
      setSafely(setIsLoading, true)
      const { data } = await axios.get<ManageCasesResponse>(`/cases`)
      dispatch(setCases(data.cases))
      dispatch(setActiveCases(data.cases.filter((c) => c.status === 'active')))
      dispatch(setTotalFileSizeByCase(data.caseTotalFileSizes))
      dispatch(setAssignedUserCount(data.assignedUserCount))
      hasRun.current = true
    } catch (err) {
      setSafely(setIsError, true)
      showStatus('Failed to load cases', 'error')
    } finally {
      setSafely(setIsLoading, false)
    }
  }

  async function search(params: CaseSearchParams) {
    try {
      setSafely(setIsLoading, true)
      const { data } = await axios.post<Case[]>('/cases/search', params)
      dispatch(setSearchCases(data))
    } catch (err) {
      setSafely(setIsError, true)
      showStatus('Failed to load search results', 'error')
    } finally {
      setSafely(setIsLoading, false)
    }
  }

  function setSearchMode(val: boolean) {
    console.log(`Setting search mode: ${val}`)
    setSafely(setIsSearchMode, val)
  }

  return {
    loadCases,
    search,
    setSearchMode,
    hasRun: hasRun.current,
    cases,
    companyId,
    isLoading,
    isError,
    isSearchMode,
  }
}
