import { find } from 'lodash'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class PersonalFolderUpgrade extends BaseCommand {
  public static commandName = 'personal:upgrade_company'

  public static description = 'Sync companyId for each personal folder'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async update(folderId: number, companyId: number) {
    const { default: PersonalFolder } = await import('App/Models/PersonalFolder')

    const personalFolder = await PersonalFolder.findOrFail(folderId)
    personalFolder.companyId = companyId
    await personalFolder.save()

    if (personalFolder.$isPersisted) {
      this.logger.success(`${personalFolder.name} was updated`)
    } else {
      this.logger.error(`${personalFolder.name} failed to update`)
    }
  }

  public async run() {
    const { default: Company } = await import('App/Models/Company')
    const { default: Role } = await import('App/Models/Role')
    const { default: PersonalFolder } = await import('App/Models/PersonalFolder')

    const folders = await PersonalFolder.query()
      .select('id', 'user_id', 'company_id', 'name')
      .orderBy('id', 'asc')
      .pojo<{ id: number; user_id: number; company_id: number; name: string }>()

    const roles = await Role.query()
      .select('id', 'user_id', 'company_id', 'role')
      .orderBy('id', 'asc')
      .pojo<{ id: number; user_id: number; company_id: number; role: string }>()

    const companies = await Company.query()
      .select('id', 'user_id', 'name')
      .orderBy('id', 'asc')
      .pojo<{ id: number; user_id: number; name: string }>()

    for (let folder of folders) {
      const roleUser = find(roles, { user_id: folder.user_id })
      const accountOwner = find(companies, { user_id: folder.user_id })

      if (roleUser !== undefined) {
        this.logger.info(`Updating Role User: ${roleUser.role} (${roleUser.user_id})`)
        await this.update(folder.id, roleUser.company_id)
      }

      if (accountOwner !== undefined) {
        this.logger.info(`Updating Account Owner: ${accountOwner.name} (${folder.user_id})`)

        await this.update(folder.id, accountOwner.id)
      }
    }
  }
}
