import WorkGroupFile from 'App/Models/WorkGroupFile'
import PersonalFile from 'App/Models/PersonalFile'
import { WorkGroupFileStatus } from 'App/types'
import { last } from 'lodash'

export default class DuplicateFileHandler {
  public resource: 'workgroup' | 'personal'
  public folderId: number
  public filename: string
  public status: WorkGroupFileStatus

  constructor(
    resource: 'workgroup' | 'personal',
    folderId: number,
    filename: string,
    status: WorkGroupFileStatus = 'active'
  ) {
    this.resource = resource
    this.folderId = folderId
    this.filename = filename
    this.status = status
  }

  public async handle(): Promise<string> {
    if (this.resource === 'workgroup') {
      return await this.handleWorkGroup()
    }

    return await this.handlePersonal()
  }

  public async handleWorkGroup(): Promise<string> {
    if (await this.workGroupFilenameConflicts()) {
      const ordinal = await this.workGroupFindNextOrdinal(true)
      return this.formatDuplicateFilename(ordinal)
    }

    return this.filename
  }

  public async handlePersonal(): Promise<string> {
    if (await this.personalFilenameConflicts()) {
      const ordinal = await this.personalFindNextOrdinal(true)
      return this.formatDuplicateFilename(ordinal)
    }

    return this.filename
  }

  public async workGroupFilenameConflicts(): Promise<boolean> {
    const files = await WorkGroupFile.query()
      .count('id as total')
      .withScopes((scope) => scope.byFolderAndName(this.folderId, this.filename, this.status))
      .pojo<{ total: number }>()

    return Boolean(files[0].total)
  }

  public async workGroupFindNextOrdinal(conflict: boolean): Promise<number> {
    const { base, extension } = this.deconstructFilename(this.filename)

    const files = await WorkGroupFile.query()
      .select('name')
      .where('work_group_folder_id', this.folderId)
      .where('status', this.status)
      .where('name', 'like', `${base} (%)${extension}`)

    return files.length + Number(conflict)
  }

  public async personalFilenameConflicts(): Promise<boolean> {
    const files = await PersonalFile.query()
      .count('id as total')
      .withScopes((scope) => scope.byFolderAndName(this.folderId, this.filename, this.status))
      .pojo<{ total: number }>()

    return Boolean(files[0].total)
  }

  public async personalFindNextOrdinal(conflict: boolean): Promise<number> {
    const { base, extension } = this.deconstructFilename(this.filename)

    const files = await PersonalFile.query()
      .select('name')
      .where('personal_folder_id', this.folderId)
      .where('name', 'like', `${base} (%)${extension}`)

    return files.length + Number(conflict)
  }

  public formatDuplicateFilename(ordinal: number): string {
    const { base, extension } = this.deconstructFilename(this.filename)
    return `${base} (${ordinal})${extension}`
  }

  public deconstructFilename(input: string) {
    const parts = input.split('.')
    const extension = `.${last(parts)}`
    const base = input.slice(0, -extension.length)

    return { base, extension }
  }
}
