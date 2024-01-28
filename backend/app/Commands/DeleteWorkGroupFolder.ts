import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class DeleteWorkGroupFolder extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'workgroup:delete_folder'
  public static description = 'Delete WorkGroup Folder in db only'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: WorkGroupFolder } = await import('App/Models/WorkGroupFolder')
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const workGroupFolderId = Number(
      (await this.prompt.ask('Enter workgroup folderId to delete')).trim()
    )

    try {
      const parent = await WorkGroupFolder.findOrFail(workGroupFolderId)
      const folders = await WorkGroupFolder.getFoldersIn(parent.caseId, parent.id, ['active'])
      const folderIds = folders.map((f) => f.id)
      folderIds.unshift(parent.id)

      const files = await WorkGroupFile.query()
        .select('id')
        .whereIn('work_group_folder_id', folderIds)

      const fileIds = files.map((f) => f.id)

      await this.prompt.confirm(
        `Go ahead and delete ${folderIds.length} folders and ${fileIds.length} files from the database?`
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
