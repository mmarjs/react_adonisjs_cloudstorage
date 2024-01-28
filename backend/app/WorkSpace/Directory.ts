import Role from 'App/Models/Role'
import Authorization from 'App/Auth/Authorization'
import { Either } from 'App/types'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import PersonalFolder from 'App/Models/PersonalFolder'

export default async function directory(
  userId: number,
  companyId: number,
  caseId: number
): Promise<Either<object>> {
  const authorization = new Authorization(userId, companyId, 'read', 'case', caseId)
  const isAuthorized = await authorization.isAuthorized()

  if (!isAuthorized) {
    return { error: 'user-has-no-read-permission' }
  }

  const users = await Role.userNames(companyId)
  const workGroup = await WorkGroupFolder.getFoldersWithPath(caseId, 0, ['active'])
  const personal = await PersonalFolder.getFoldersWithPath(userId, 0, ['active'])

  return {
    error: null,
    success: {
      users,
      workGroupData: workGroup,
      personalData: personal,
    },
  }
}
