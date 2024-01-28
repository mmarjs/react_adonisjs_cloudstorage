import Case from 'App/Models/Case'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import Permission from 'App/Models/Permission'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import PermissionMaker from 'App/Lib/PermissionMaker'
import { CreateCaseParams, Either } from 'App/types'
import EventDispatcher from 'App/Event/EventDispatcher'

export default class StoreCase {
  public userId: number
  public companyId: number
  public params: CreateCaseParams
  public user: User
  public companyName: string
  public caseId: number

  constructor(userId: number, companyId: number, params: CreateCaseParams) {
    this.userId = userId
    this.companyId = companyId
    this.params = params
  }

  public async store(): Promise<Either<boolean>> {
    this.user = await this.getUser()
    this.companyName = await this.getCompanyName()
    const caseId = await this.create()

    if (!caseId) {
      return { error: 'could-not-create-case' }
    }

    this.caseId = caseId

    const isUserAdded = await this.addUser()

    if (!isUserAdded) {
      return { error: 'could-not-add-user' }
    }

    await EventDispatcher.dispatch({
      userId: this.userId,
      companyId: this.companyId,
      name: 'case-created',
      resource: 'case',
      resourceId: this.caseId,
    })

    return { error: null, success: true }
  }

  private async create() {
    const nextPublicId = await Case.nextPublicId(this.companyId)
    const role = await Role.currentRole(this.userId, this.companyId)
    const isCaseManager = role === 'case-manager'

    return await Database.transaction(async (trx) => {
      const c = new Case()
      c.useTransaction(trx)
      c.companyId = this.params.companyId
      c.caseTypeId = this.params.caseTypeId
      c.timeZoneId = this.params.timeZoneId
      c.publicCaseId = nextPublicId
      c.createdById = this.userId
      c.status = 'active'

      if (this.params.caseNumber) {
        c.caseNumber = this.params.caseNumber
      }

      if (this.params.caseName) {
        c.caseName = this.params.caseName
      }

      if (this.params.clientName) {
        c.clientName = this.params.clientName
      }

      if (this.params.clientReference) {
        c.clientReference = this.params.clientReference
      }

      if (this.params.clientReference) {
        c.clientReference = this.params.clientReference
      }

      if (this.params.clientPhone) {
        c.clientPhone = this.params.clientPhone
      }

      if (this.params.clientEmail) {
        c.clientEmail = this.params.clientEmail
      }

      if (this.params.notes) {
        c.notes = this.params.notes
      }

      await c.save()

      const folder = new WorkGroupFolder()
      folder.useTransaction(trx)
      folder.name = 'Workgroup'
      folder.caseId = c.id
      folder.parentId = 0
      folder.status = 'active'
      folder.access = 'private'
      folder.ownerId = this.userId
      folder.ownerName = this.user.fullName

      await folder.save()

      if (isCaseManager) {
        await PermissionMaker.make(
          this.userId,
          this.companyId,
          c.id,
          'case',
          Permission.actions,
          trx
        )
      }

      if (!c.$isPersisted) {
        return null
      }

      return c.id
    })
  }

  private async addUser() {
    const role = await Role.currentRole(this.userId, this.companyId)

    if (User.adminRoles.includes(role)) {
      return true
    }

    return await Database.transaction(async (trx) => {
      if (role === 'case-manager') {
        await PermissionMaker.make(
          this.userId,
          this.companyId,
          this.caseId,
          'case',
          Permission.actions,
          trx
        )
      }

      if (role === 'client-user') {
        await PermissionMaker.make(
          this.userId,
          this.companyId,
          this.caseId,
          'case',
          ['read', 'write'],
          trx
        )
      }

      return true
    })
  }

  private async getUser() {
    return await User.query()
      .select('first_name', 'last_name', 'email')
      .where('id', this.userId)
      .firstOrFail()
  }

  private async getCompanyName(): Promise<string> {
    const company = await Company.query()
      .select('name')
      .where('id', this.companyId)
      .pojo<{ name: string }>()
      .firstOrFail()

    return company.name
  }
}
