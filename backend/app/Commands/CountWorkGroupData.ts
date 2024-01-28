import filesize from 'filesize'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class CountWorkGroupData extends BaseCommand {
  public static commandName = 'workgroup:count'
  public static description = 'Count Work Group Files and Folders'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Case } = await import('App/Models/Case')
    const { default: WorkGroupFolder } = await import('App/Models/WorkGroupFolder')
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')

    const caseId = Number((await this.prompt.ask('Enter workgroup caseId')).trim())

    const caseInstance = await Case.find(caseId)

    if (caseInstance === null) {
      this.logger.error(`${caseId} does not exist`)
      await this.exit()
      return
    }

    const status = await this.prompt.choice('Choose a status', [
      'pending',
      'active',
      'updating',
      'trashed',
      'transferred',
    ])

    await this.prompt.confirm(`Lookup count for case ${caseInstance.caseName}?`)

    const folders = await WorkGroupFolder.query()
      .select('id')
      .where('case_id', caseId)
      .where('status', status)

    const folderIds = folders.map((f) => f.id)

    if (folderIds.length === 0) {
      this.logger.error(`No folders are in that case.`)
      await this.exit()
    }

    const files = await WorkGroupFile.query()
      .select('id', 'size')
      .whereIn('work_group_folder_id', folderIds)
      .where('status', status)

    const fileIds = files.map((f) => f.id)
    const bytes = files.map((f) => f.size).reduce((a, b) => a + b, 0)
    const formattedSize = filesize(bytes)

    this.logger.success(`There are ${folderIds.length} folders and ${fileIds.length}  files.`)
    this.logger.success(
      `The total file size is ${formattedSize} or ${bytes.toLocaleString()} bytes`
    )
  }
}
