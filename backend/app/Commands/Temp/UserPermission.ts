import { BaseCommand } from '@adonisjs/core/build/standalone'
import fs from 'fs'

interface Record {
  user_id: number
  resource_id: number
}

export default class UserPermission extends BaseCommand {
  public static commandName = 'backfill:permissions'
  public static description = 'Backfill user permissions for Auth Upgrade Nov 2021'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Role } = await import('App/Models/Role')
    const { default: Permission } = await import('App/Models/Permission')
    const { default: PermissionMaker } = await import('App/Lib/PermissionMaker')

    const path = await this.prompt.ask('Please enter the location of the permissions file')

    try {
      const contents = fs.readFileSync(path.trim())
      const records = JSON.parse(contents.toString()) as Record[]

      let map = records.reduce((mapAccumulator, obj) => {
        mapAccumulator.set(obj.user_id, obj.user_id)

        return mapAccumulator
      }, new Map<number, number>())

      const userIds = records.map((r) => r.user_id)

      const roles = await Role.query()
        .whereIn('role', ['case-manager', 'client-user'])
        .whereIn('user_id', userIds)

      const confirm = await this.prompt.confirm(
        `You want to backfill the permissions for ${roles.length} users?`
      )

      if (!confirm) {
        this.logger.error('Aborting backfill')
        await this.exit()
      }

      for (let role of roles) {
        if (role.role === 'case-manager') {
          this.logger.debug(`Setting permissions for ${role.role} with id ${role.userId}`)

          const caseId = map.get(role.userId)

          if (caseId !== undefined) {
            await PermissionMaker.make(
              role.userId,
              role.companyId,
              caseId,
              'case',
              Permission.actions
            )
          } else {
            this.logger.error(`Could not find caseId in map for user ${role.userId}`)
            continue
          }
        }

        if (role.role === 'client-user') {
          this.logger.debug(`Setting permissions for ${role.role} with id ${role.userId}`)

          const caseId = map.get(role.userId)

          if (caseId !== undefined) {
            await PermissionMaker.make(role.userId, role.companyId, caseId, 'case', [
              'read',
              'write',
            ])
          } else {
            this.logger.error(`Could not find caseId in map for user ${role.userId}`)
            continue
          }
        }
      }
    } catch (err) {
      this.logger.error(`${err?.message}`)
      await this.exit()
    }

    this.logger.success('Done!')
  }
}
