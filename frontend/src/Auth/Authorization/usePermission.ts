import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { isAdmin } from 'Lib'
import { PolicyAction, PolicyResource, AccountRole } from 'types'

export function usePermission() {
  const role = useSelector((state: AppState) => state.user.role) as AccountRole
  const permissions = useSelector((state: AppState) => state.permissions.permissions)

  const hasSpecific = (
    action: PolicyAction,
    resource: PolicyResource,
    resourceId: number
  ): boolean => {
    if (isAdmin(role)) {
      return true
    }

    const permission = permissions.filter((p) => {
      return p.action === action && p.resource === resource && p.resourceId === resourceId
    })

    return permission.length > 0
  }

  const hasSome = (resource: PolicyResource, resourceId: number): boolean => {
    if (isAdmin(role)) {
      return true
    }

    return permissions.some((p) => p.resource === resource && p.resourceId === resourceId)
  }

  return { hasSpecific, hasSome }
}
