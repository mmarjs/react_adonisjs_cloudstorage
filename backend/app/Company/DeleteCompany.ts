import Env from '@ioc:Adonis/Core/Env'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import Company from 'App/Models/Company'
import Case from 'App/Models/Case'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import PersonalFile from 'App/Models/PersonalFile'
import PersonalFolder from 'App/Models/PersonalFolder'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import NotificationSetting from 'App/Models/NotificationSetting'
import Permission from 'App/Models/Permission'
import { deleteObject } from 'App/Wasabi/Wasabi'
import { wasabiConfig } from 'App/Wasabi/WasabiConfig'
import { WasabiLocation } from 'App/types'

/**
 * Order of deletion
 * 1. notifications
 * 2. permissions
 * 3. files in wasabi
 * 4. work group file in db
 * 5. work group folders
 * 6. personal files in db
 * 7. personal folders
 * 8. cases
 * 9. company members
 * 10. company
 * 11. all the userIds
 */

export default class DeleteCompany {
  public company: Company
  public dryRun: boolean
  public notificationIds: number[] = []
  public permissionIds: number[] = []
  public wasabiFiles: WasabiLocation[] = []
  public workGroupFileIds: number[] = []
  public workGroupFolderIds: number[] = []
  public personalFileIds: number[] = []
  public personalFolderIds: number[] = []
  public caseIds: number[] = []
  public roleIds: number[] = []
  public userIds: number[] = []

  constructor(company: Company, dryRun: boolean = true) {
    this.company = company
    this.dryRun = dryRun
  }

  public async prepare() {
    await this.setNotifications()
    await this.setPermissions()
    await this.setPersonalFolders()
    await this.setWorkGroupFolders()
    await this.setPersonalFiles()
    await this.setWorkGroupFiles()
    await this.setRoles()
    await this.setCases()
    await this.setUsers()
  }

  public async run() {
    await this.prepare()

    if (this.dryRun === true) {
      this.doDryRun()
      return
    }

    await this.realRun()
  }

  private doDryRun() {
    console.group(`DRY RUN DELETE OF ${this.company.name.toUpperCase()}`)

    console.log('Notifications To Delete')
    console.table(this.notificationIds)

    console.log('Permissions To Delete')
    console.table(this.permissionIds)

    console.log('Permissions To Delete')
    console.table(this.permissionIds)

    console.log('Wasabi Files To Delete')
    console.table(this.wasabiFiles, ['bucket', 'path'])

    console.log('Work Group Files To Delete')
    console.table(this.workGroupFileIds)

    console.log('Work Group Folders to Delete')
    console.table(this.workGroupFolderIds)

    console.log('Personal Files To Delete')
    console.table(this.personalFileIds)

    console.log('Personal Folders To Delete')
    console.table(this.personalFolderIds)

    console.log('Cases To Delete')
    console.table(this.caseIds)

    console.log('Roles To Delete')
    console.table(this.roleIds)

    console.log('Company To Delete')
    console.table([this.company.id])

    console.log('Users To Delete')
    console.table(this.userIds)
    console.groupEnd()
  }

  private async realRun() {}

  /** Set Methods */

  protected async setNotifications() {
    const settings = await NotificationSetting.query().select('id').whereIn('user_id', this.userIds)
    this.notificationIds = settings.map((s) => s.id)
  }

  protected async setPermissions() {
    const permissions = await Permission.query().select('id').whereIn('user_id', this.userIds)
    this.permissionIds = permissions.map((p) => p.id)
  }

  protected async setWorkGroupFolders() {
    const folders = await WorkGroupFolder.query().whereIn('case_id', this.caseIds)
    this.workGroupFolderIds = folders.map((f) => f.id)
  }

  protected async setWorkGroupFiles() {
    const files = await WorkGroupFile.query()
      .select('id', 'path')
      .whereIn('work_group_folder_id', this.workGroupFileIds)

    this.workGroupFileIds = files.map((f) => f.id)

    files.forEach((f) => {
      this.wasabiFiles.push({ bucket: 'workspace', path: f.path })
    })
  }

  protected async setPersonalFolders() {
    const folders = await PersonalFolder.query()
      .whereIn('user_id', this.userIds)
      .where('company_id', this.company.id)
    this.personalFolderIds = folders.map((f) => f.id)
  }

  protected async setPersonalFiles() {
    const files = await PersonalFile.query()
      .select('id', 'path')
      .whereIn('personal_folder_id', this.personalFolderIds)
    this.personalFileIds = files.map((f) => f.id)
    files.forEach((f) => {
      this.wasabiFiles.push({ bucket: 'workspace', path: f.path })
    })
  }

  protected async setRoles() {
    const roles = await Role.query().select('id').where('company_id', this.company.id)
    this.roleIds = roles.map((c) => c.id)
  }

  protected async setCases() {
    const cases = await Case.query().select('id').where('company_id', this.company.id)
    this.caseIds = cases.map((c) => c.id)
  }

  protected async setUsers() {
    const userIds = await Role.userIds(this.company.id)
    this.userIds = userIds
  }

  /** Delete Methods */

  protected async deleteUsers(trx: TransactionClientContract) {
    await User.query({ client: trx })
      .whereIn('id', this.userIds)
      .delete()
      .limit(this.userIds.length)
  }

  protected async deleteCases(trx: TransactionClientContract) {
    await Case.query({ client: trx })
      .whereIn('id', this.caseIds)
      .delete()
      .limit(this.caseIds.length)
  }

  protected async deletePersonalFolders(trx: TransactionClientContract) {
    await PersonalFolder.query({ client: trx })
      .whereIn('id', this.personalFolderIds)
      .delete()
      .limit(this.personalFolderIds.length)
  }

  protected async deleteWorkGroupFolders(trx: TransactionClientContract) {
    await WorkGroupFolder.query({ client: trx })
      .whereIn('id', this.workGroupFolderIds)
      .delete()
      .limit(this.workGroupFolderIds.length)
  }

  protected async deletePersonalFiles(trx: TransactionClientContract) {
    await PersonalFile.query({ client: trx })
      .whereIn('id', this.personalFileIds)
      .delete()
      .limit(this.personalFileIds.length)
  }

  protected async deleteWorkGroupFiles(trx: TransactionClientContract) {
    await WorkGroupFile.query({ client: trx })
      .whereIn('id', this.workGroupFileIds)
      .delete()
      .limit(this.workGroupFileIds.length)
  }

  protected async deleteNotifications(trx: TransactionClientContract) {
    await NotificationSetting.query({ client: trx })
      .whereIn('id', this.notificationIds)
      .delete()
      .limit(this.notificationIds.length)
  }

  protected async deletePermissions(trx: TransactionClientContract) {
    await Permission.query({ client: trx })
      .whereIn('id', this.permissionIds)
      .delete()
      .limit(this.permissionIds.length)
  }

  protected async deleteWasabiFiles() {
    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))
    for (let file of this.wasabiFiles) {
      const res = await deleteObject(config, file.path)
      if (!res) {
        console.warn(`Could not delete ${file.path} in ${file.bucket}`)
        return false
      }
    }

    return true
  }
}
