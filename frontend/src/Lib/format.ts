import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AccountRole, BillingStatus } from 'types'

dayjs.extend(relativeTime)

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const clamp = (value: string = '', limit: number): string => {
  if (typeof value !== 'string') {
    return value
  }

  if (value.length > limit) {
    const substring = value.substring(0, limit)
    return `${substring}...`
  }

  return value
}

export function formatLoginDate(date: string | null): string {
  if (date === null || typeof date !== 'string') {
    return 'Never'
  }

  return dayjs(date).format('YYYY-MM-DD hh:mm:ss A')
}

export function formatRoleName(role: string): string {
  switch (role) {
    case 'account-owner':
      return 'Account Owner'
    case 'account-admin':
      return 'Administrator'
    case 'case-manager':
      return 'Case Manager'
    case 'client-user':
      return 'Client User'
    default:
      return ''
  }
}

export function inverseFormatRoleName(role: string): AccountRole {
  switch (role) {
    case 'Account Owner':
      return 'account-owner'
    case 'Administrator':
      return 'account-admin'
    case 'Case Manager':
      return 'case-manager'
    case 'Client User':
      return 'client-user'
    default:
      return 'client-user'
  }
}

export function onOrOff(val: boolean): 'On' | 'Off' {
  return val === true ? 'On' : 'Off'
}

export function companyStatus(billingStatus: BillingStatus): string {
  return billingStatus.charAt(0).toUpperCase() + billingStatus.slice(1)
}

export function relativeDate(val: string) {
  return dayjs(val).fromNow()
}
