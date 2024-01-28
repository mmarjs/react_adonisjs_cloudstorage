import { BaseCommand } from '@adonisjs/core/build/standalone'
import { uniq } from 'lodash'

type Resource = 'workgroup' | 'personal'

export default class FindTotalFileSize extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'folders:find_size'
  public static description = 'Find Total File Sizes'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: WorkGroupFolder } = await import('App/Models/WorkGroupFolder')
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')
    const { default: PersonalFolder } = await import('App/Models/PersonalFolder')
    const { default: PersonalFile } = await import('App/Models/PersonalFile')
    const { default: filesize } = await import('filesize')

    const resource = (await this.prompt.choice('Enter resource', [
      {
        name: 'workgroup',
        message: 'Workgroup Folders',
      },
      {
        name: 'personal',
        message: 'Personal Folders',
      },
    ])) as Resource

    const resourceId = Number(await this.prompt.ask('Enter Case or User ID'))

    const folderEnum = await this.prompt.enum('Enter folderIds')
    const folderIds = folderEnum.map(function (folderId) {
      return parseInt(folderId, 10)
    })

    if (resource === 'personal') {
      const allFolderIds: number[] = []

      for (let folderId of folderIds) {
        const ids = await PersonalFolder.getFolderIdsIn(folderId, resourceId)
        ids.forEach((id) => {
          allFolderIds.push(id)
        })
      }

      const bytes = await PersonalFile.getFileSizeByFolderIds(uniq(allFolderIds))
      const fz = filesize(bytes, { base: 2 })
      this.logger.success(`The total amount of files in the personal folders is ${fz}`)
    }

    if (resource === 'workgroup') {
      const allFolderIds: number[] = []

      for (let folderId of folderIds) {
        const ids = await WorkGroupFolder.getFolderIdsIn(Number(folderId), resourceId)
        ids.forEach((id) => {
          allFolderIds.push(id)
        })
      }

      const bytes = await WorkGroupFile.getFileSizeByFolderIds(uniq(allFolderIds))

      const fz = filesize(bytes, { base: 2 })
      this.logger.success(`The total amount of files in the workgroup folders is ${fz}`)
    }
  }
}
