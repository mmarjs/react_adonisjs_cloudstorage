import cuid from 'cuid'
import Auth from 'App/Auth/Auth'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import ShareLink from 'App/Models/ShareLink'

import { CompanyUser, CompanyUserIds, AccountRole, StandardError } from 'App/types'

export async function makeAuth(
  userId: number,
  companyId: number,
  shareLinkId?: number
): Promise<string> {
  const token = cuid()
  const auth = new Auth(token)
  await auth.store(userId, companyId, shareLinkId)

  return token
}

export async function deleteAuth(token: string): Promise<void> {
  const auth = new Auth(token)
  await auth.delete()
}

export async function getUserByToken(token: any): Promise<User> {
  if (typeof token !== 'string') {
    throw new Error('invalid-auth-token')
  }

  const auth = new Auth(token)
  const user = await auth.getUser()

  if (user === null) {
    throw new Error('cannot-fetch-user')
  }

  return user
}

export async function getCompanyByToken(token: any): Promise<Company> {
  if (typeof token !== 'string') {
    throw new Error('invalid-auth-token')
  }
  const auth = new Auth(token)
  const company = await auth.getCompany()

  if (company === null) {
    throw new Error('cannot-fetch-company')
  }

  return company
}

export async function getCompanyUserByToken(token: any): Promise<CompanyUser> {
  if (typeof token !== 'string') {
    throw new Error('invalid-auth-token')
  }

  const auth = new Auth(token)
  const user = await auth.getUser()
  const company = await auth.getCompany()

  if (user === null) {
    throw new Error('cannot-fetch-user')
  }

  if (company === null) {
    throw new Error('cannot-fetch-company')
  }

  return { user, company }
}

export async function getCompanyUserIdsByToken(token: any): Promise<CompanyUserIds> {
  if (typeof token !== 'string') {
    throw new Error('invalid-auth-token')
  }

  const auth = new Auth(token)
  const { companyId, userId } = await auth.fetch()

  const user = await User.find(userId)

  if (user === null) {
    throw new Error('cannot-fetch-user')
  }

  return { userId: user.id, companyId }
}

export async function getShareLinkByToken(token: any): Promise<ShareLink> {
  if (typeof token !== 'string') {
    throw new Error('invalid-auth-token')
  }

  const auth = new Auth(token)
  const shareLink = await auth.getShareLink()

  if (shareLink === null) {
    throw new Error('cannot-fetch-share-link')
  }

  return shareLink
}

export async function getShareLinkGrantorByToken(token: any): Promise<User> {
  const shareLink = await getShareLinkByToken(token)
  await shareLink.load('grantedBy')
  return shareLink.grantedBy
}

export async function isShareLinkUser(token: any): Promise<boolean> {
  if (typeof token !== 'string') {
    return false
  }

  const auth = new Auth(token)
  const authToken = await auth.fetch()

  return authToken?.shareLinkId !== undefined
}

export function roleNameWithPrefix(role: AccountRole): string {
  if (role === 'account-owner') {
    return 'an Account Owner'
  }

  if (role === 'account-admin') {
    return 'an Account Admin'
  }

  if (role === 'case-manager') {
    return 'a Case Manager'
  }

  return 'a Client User'
}

export function isStandardError(res: object): res is StandardError {
  if (typeof res === 'object' && 'error' in res) {
    // @ts-ignore
    if (typeof res?.error === 'string') {
      return true
    } else {
      return false
    }
  }

  return false
}

export const allowableStatus = ['pending', 'active', 'updating', 'trashed', 'transferred']

export function getItemReplacementList(currentIds: number[], newIds: number[]) {
  if (newIds.length === 0) {
    return { itemsToDelete: [], itemsToAdd: [] }
  }

  const toDelete = new Set<number>()
  const toAdd = new Set<number>()

  for (let id of currentIds) {
    if (!newIds.includes(id)) {
      toDelete.add(id)
    }
  }

  for (let id of newIds) {
    if (!currentIds.includes(id)) {
      toAdd.add(id)
    }
  }
  return { itemsToDelete: Array.from(toDelete), itemsToAdd: Array.from(toAdd) }
}
