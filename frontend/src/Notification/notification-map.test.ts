import NotificationMap from './NotificationMap'

describe('NotificationMap', () => {
  it('isNotifableEvent returns true for account owner with case-created event', () => {
    const map = new NotificationMap('case-created', 'account-owner')
    const isNotifiable = map.isNotifableEvent()
    expect(isNotifiable).toBe(true)
  })

  it('isNotifableEvent returns true for account admin with case-created event', () => {
    const map = new NotificationMap('case-created', 'account-admin')
    const isNotifiable = map.isNotifableEvent()
    expect(isNotifiable).toBe(true)
  })

  it('isNotifableEvent returns true for case-manager with case-created event', () => {
    const map = new NotificationMap('case-created', 'case-manager')
    const isNotifiable = map.isNotifableEvent()
    expect(isNotifiable).toBe(true)
  })

  it('isNotifableEvent returns false for client-user with case-created event', () => {
    const map = new NotificationMap('case-created', 'client-user')
    const isNotifiable = map.isNotifableEvent()
    expect(isNotifiable).toBe(false)
  })
})
