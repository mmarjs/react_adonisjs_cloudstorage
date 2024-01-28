import { DateTime } from 'luxon'
import { toInteger } from 'lodash'
import padLeft from 'pad-left'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import CaseType from 'App/Models/CaseType'
import TimeZone from 'App/Models/TimeZone'
import Evidence from 'App/Models/Evidence'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { WorkGroupFolderStatus, WorkGroupFileStatus, CaseStatus } from 'App/types'

export default class Case extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public companyId: number

  @column()
  public caseTypeId: number

  @column()
  public timeZoneId: number

  @column()
  public publicCaseId: string

  @column()
  public createdById: number

  @column()
  public caseNumber: string | null

  @column()
  public caseName: string | null

  @column()
  public clientName: string

  @column()
  public clientReference: string | null

  @column()
  public clientPhone: string | null

  @column()
  public clientEmail: string

  @column()
  public notes: string | null

  @column()
  public status: CaseStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ autoCreate: false, autoUpdate: false })
  public deletedAt: DateTime

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @belongsTo(() => CaseType)
  public caseType: BelongsTo<typeof CaseType>

  @belongsTo(() => TimeZone)
  public timeZone: BelongsTo<typeof TimeZone>

  @hasMany(() => Evidence)
  public evidence: HasMany<typeof Evidence>

  @belongsTo(() => User, {
    foreignKey: 'createdById',
    localKey: 'id',
  })
  public createdBy: BelongsTo<typeof User>

  @hasMany(() => WorkGroupFolder)
  public workGroupFolders: HasMany<typeof WorkGroupFolder>

  public static async nextPublicId(companyId: number) {
    const latest = await Case.query()
      .select('public_case_id')
      .where('company_id', companyId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .first()

    if (latest === null) {
      return `CID0000001`
    }

    const [, lastId] = latest.publicCaseId.split('CID')
    const nextId = toInteger(lastId) + 1
    const pad = padLeft(`${nextId}`, 7, '0')

    return `CID${pad}`
  }

  public static async idsByCompany(companyId: number): Promise<number[]> {
    const cases = await Case.query()
      .select('id')
      .where('company_id', companyId)
      .orderBy('id', 'asc')
      .pojo<{ id: number }>()

    return cases.map((c) => c.id)
  }

  public static async belongsToCompany(caseId: number, companyId: number): Promise<boolean> {
    const caseIds = await Case.idsByCompany(companyId)

    return caseIds.includes(caseId)
  }

  public static async totalFileSize(
    caseIds: number[],
    folderStatus: WorkGroupFolderStatus = 'active',
    fileStatus: WorkGroupFileStatus = 'active'
  ) {
    const folders = await WorkGroupFolder.query()
      .select('id')
      .whereIn('case_id', caseIds)
      .where('status', folderStatus)
      .pojo<{ id: number }>()

    const folderIds = folders.map((f) => f.id)

    const files = await WorkGroupFile.query()
      .sum('size as total')
      .whereIn('work_group_folder_id', folderIds)
      .where('status', fileStatus)
      .pojo<{ total: number }>()
      .first()

    return files?.total ?? 0
  }

  public static async fileSizeWithCaseId(caseIds: number[]) {
    const rows = await Database.query()
      .select('work_folder.case_id')
      .from('work_group_folders as work_folder')
      .sum('work_file.size as totalSize')
      .leftJoin('work_group_files as work_file', 'work_folder.id', 'work_file.work_group_folder_id')
      .where('work_file.status', 'active')
      .whereIn('work_folder.case_id', caseIds)
      .groupBy('work_folder.case_id')

    return rows as { case_id: number; fileSize: number }[]
  }

  public static async getCaseName(caseId: number) {
    const c = await Case.query()
      .select('case_name')
      .where({ id: caseId })
      .pojo<{ case_name: string }>()
      .first()

    return c?.case_name ?? ''
  }
}
