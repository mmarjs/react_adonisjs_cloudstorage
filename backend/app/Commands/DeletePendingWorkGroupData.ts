import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class DeletePendingWorkGroupData extends BaseCommand {
  public static commandName = 'workgroup:delete_pending'
  public static description = 'Delete Pending WorkGroup Data'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: WorkGroupFolder } = await import('App/Models/WorkGroupFolder')
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const caseId = Number(
      (await this.prompt.ask('Enter the case id to delete pending data by')).trim()
    )

    try {
      const folders = await WorkGroupFolder.query()
        .select('id')
        .where('case_id', caseId)
        .whereNull('parent_id')
        .where('status', 'pending')

      const folderIds = folders.map((f) => f.id)

      const files = await WorkGroupFile.query()
        .select('id')
        .whereIn('work_group_folder_id', folderIds)

      const fileIds = files.map((f) => f.id)

      await this.prompt.confirm(
        `Go ahead and delete ${folderIds.length} pending folders and ${fileIds.length} pending files from the database?`
      )

      const numberFilesDeleted = await Database.transaction(async (trx) => {
        const res = await WorkGroupFile.query({ client: trx })
          .whereIn('id', fileIds)
          .delete()
          .limit(fileIds.length)

        return res[0] as number
      })

      if (numberFilesDeleted !== fileIds.length) {
        this.logger.error(`Only ${numberFilesDeleted}  out of ${fileIds.length} files were deleted`)
        await this.exit()
      }

      const numberFoldersDeleted = await Database.transaction(async (trx) => {
        const res = await WorkGroupFolder.query({ client: trx })
          .whereIn('id', folderIds)
          .delete()
          .limit(folderIds.length)

        return res[0] as number
      })

      if (numberFoldersDeleted !== folderIds.length) {
        this.logger.error(
          `Only ${numberFoldersDeleted} out of ${folderIds.length} folders were deleted`
        )
        await this.exit()
      }

      this.logger.success(
        `${numberFoldersDeleted} folders and ${numberFilesDeleted} files have been deleted.`
      )
    } catch (err) {
      console.dir(err)
    } finally {
      await this.exit()
    }
  }
}
