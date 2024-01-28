import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class Settings extends BaseCommand {
  public static commandName = 'backfill:settings'
  public static description = 'Backfill Notification Settings'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Role } = await import('App/Models/Role')
    const { default: SettingsMaker } = await import('App/Notification/SettingsMaker')

    const roles = await Role.query()
      .select('user_id', 'company_id', 'role')
      .orderBy('company_id')
      .orderBy('created_at')

    for (let role of roles) {
      const maker = new SettingsMaker(role.userId, role.companyId, role.role)
      const res = await maker.make()

      if (!res) {
        this.logger.error(
          `Failed to create settings for  user ${role.userId} at comany ${role.companyId}`
        )
      } else {
        this.logger.success(`Set settings for user ${role.userId} at comany ${role.companyId}`)
      }
    }
  }
}
