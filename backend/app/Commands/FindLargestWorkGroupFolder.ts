import { BaseCommand } from '@adonisjs/core/build/standalone'
import { WorkGroupFolderItem } from 'App/types'

interface FileQty {
  folder: string
  folderId: number
  qty: number
}

interface FileSize {
  folder: string
  folderId: number
  size: number
}

export default class FindLargestWorkGroupFolder extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'workgroup:largest_folder'
  public static description =
    'Find Largest WorkGroup Folder in a Case. This calculates direct children not sub folders'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const caseId = Number(await this.prompt.ask('Enter workgroup caseId'))
    const method = await this.prompt.choice('method', ['quantity', 'size'])
    const status = await this.prompt.choice('status', [
      'active',
      'pending',
      'updating',
      'trashed',
      'transferred',
    ])

    const { default: WorkGroupFolder } = await import('App/Models/WorkGroupFolder')
    const { default: filesize } = await import('filesize')

    const folders = await WorkGroupFolder.getFoldersWithPath(caseId, 0, [status])

    if (method === 'quantity') {
      const res = await this.quantity(folders)
      this.logger.success(
        `\nThe folder with the most files is:\n${res.folder}\nFolder ID ${res.folderId}\nIt has ${res.qty} files`
      )
    }

    if (method === 'size') {
      const res = await this.size(folders)
      const fz = filesize(res?.size, { base: 2 })
      this.logger.success(
        `\nThe folder with the largest total size is:\n${res.folder}\nFolder ID ${res.folderId}\nIt has ${fz}.`
      )
    }
  }

  public async quantity(folders: WorkGroupFolderItem[]): Promise<FileQty> {
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')
    const { sortBy } = await import('lodash')

    let store: FileQty[] = []

    for (let folder of folders) {
      const query = await WorkGroupFile.query()
        .count('id as total')
        .where('work_group_folder_id', folder.id)
        .pojo<{ total: number }>()

      store.push({
        folder: folder.path,
        folderId: folder.id,
        qty: query[0].total,
      })
    }

    store = store.filter((item) => item.qty !== null)
    const sorted = sortBy(store, ['qty'])
    let result = sorted[sorted.length - 1]

    return { folder: result?.folder, folderId: result?.folderId, qty: result?.qty }
  }

  public async size(folders: WorkGroupFolderItem[]): Promise<FileSize> {
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')
    const { sortBy } = await import('lodash')

    let store: FileSize[] = []

    for (let folder of folders) {
      const query = await WorkGroupFile.query()
        .sum('size as total')
        .where('work_group_folder_id', folder.id)
        .pojo<{ total: number }>()

      store.push({
        folder: folder.path,
        folderId: folder.id,
        size: query[0].total,
      })
    }

    store = store.filter((item) => item.size !== null)
    const sorted = sortBy(store, ['size'])

    const result = sorted[sorted.length - 1]

    return { folder: result?.folder, folderId: result?.folderId, size: result?.size }
  }
}
