import { User, AccountRole } from 'types'
import toString from 'lodash-es/toString'

export const admins: AccountRole[] = ['account-owner', 'account-admin']
export const employees: AccountRole[] = ['account-admin', 'case-manager']

export function isAdmin(role: AccountRole) {
  const roles: AccountRole[] = ['account-owner', 'account-admin']
  return roles.includes(role)
}

export function isCaseManager(role: AccountRole) {
  const roles: AccountRole[] = ['case-manager']
  return roles.includes(role)
}

export function isClientUser(role: AccountRole) {
  const roles: AccountRole[] = ['client-user']
  return roles.includes(role)
}

export function isEmployee(role: AccountRole) {
  const roles: AccountRole[] = ['account-admin', 'case-manager']
  return roles.includes(role)
}

export function canAccessCase(role: AccountRole) {
  const roles: AccountRole[] = ['account-owner', 'account-admin', 'case-manager']
  return roles.includes(role)
}

export function formatAddress(user: User) {
  const { street, state, zip } = user

  const items = [street, state, zip]

  const actual = items.filter((item) => item !== undefined).filter((i) => i !== '')

  const values: string[] = actual.map((i) => toString(i))

  if (values.length === 0) {
    return 'Add your address'
  }

  return values.join(', ')
}
