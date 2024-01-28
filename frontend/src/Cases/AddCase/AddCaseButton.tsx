import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ADD_CASE_URL, ADD_CREDIT_CARD_URL } from 'Lib'
import Button from '@material-ui/core/Button'
import { AppState } from 'App/reducers'

export function AddCaseButton() {
  let history = useHistory()

  let userRole = useSelector((state: AppState) => state.user.role)
  let billingStatus = useSelector((state: AppState) => state.company.billing_status)

  const handleClick = () => {
    if (billingStatus === 'unactivated') {
      history.push(ADD_CREDIT_CARD_URL)
    } else {
      history.push(ADD_CASE_URL)
    }
  }

  const hideAddCase = (role: string): boolean => {
    if (role === 'super-admin') {
      return false
    }

    if (role === 'account-owner') {
      return false
    }

    if (role === 'case-admin') {
      return false
    }

    return true
  }

  if (hideAddCase(userRole)) {
    return <></>
  }

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Create Case
      </Button>
    </>
  )
}
