import dayjs from 'dayjs'
import {
  capitalizeFirst,
  formatLoginDate,
  formatRoleName,
  inverseFormatRoleName,
  relativeDate,
} from './format'

describe('formatters', () => {
  it('capitalizeFirst returns correct capitalizaton', () => {
    const res = capitalizeFirst('alpha beta')
    expect(res).toBe('Alpha beta')
  })

  it('formatLoginDate returns Never with a null input', () => {
    const res = formatLoginDate(null)
    expect(res).toBe('Never')
  })

  it('formatLoginDate returns correct format', () => {
    const date = '2021-10-27T09:23:50.651Z'
    const res = formatLoginDate(date)
    expect(res).toBe('2021-10-27 11:23:50 AM')
  })

  it('formatRoleName returns Account Owner', () => {
    const res = formatRoleName('account-owner')
    expect(res).toBe('Account Owner')
  })

  it('formatRoleName returns Administrator', () => {
    const res = formatRoleName('account-admin')
    expect(res).toBe('Administrator')
  })

  it('formatRoleName returns Case Manager', () => {
    const res = formatRoleName('case-manager')
    expect(res).toBe('Case Manager')
  })

  it('formatRoleName returns Client User', () => {
    const res = formatRoleName('client-user')
    expect(res).toBe('Client User')
  })

  it('formatRoleName returns empty string', () => {
    const res = formatRoleName('client-users')
    expect(res).toBe('')
  })

  it('inverseFormatRoleName returns Account Owner', () => {
    const res = inverseFormatRoleName('Account Owner')
    expect(res).toBe('account-owner')
  })

  it('inverseFormatRoleName returns account-admin', () => {
    const res = inverseFormatRoleName('Administrator')
    expect(res).toBe('account-admin')
  })

  it('inverseFormatRoleName returns case-manager', () => {
    const res = inverseFormatRoleName('Case Manager')
    expect(res).toBe('case-manager')
  })

  it('inverseFormatRoleName returns client-user', () => {
    const res = inverseFormatRoleName('Client User')
    expect(res).toBe('client-user')
  })

  it('relativeDate returns 3 days ago', () => {
    const date = dayjs().subtract(3, 'day').format()
    const res = relativeDate(date)
    expect(res).toBe('3 days ago')
  })
})
