import { Parser } from 'json2csv'
import S3 from 'aws-sdk/clients/s3'
import { DateTime } from 'luxon'
import { BaseCommand } from '@adonisjs/core/build/standalone'

interface FolderResult {
  id: number
  parentId: number
  name: string
  status: string
  path: string
}

interface FolderItem {
  id: number
  name: string
  path: string
}

interface FileItem {
  name: string
  size: number
  path: string
}

export default class ExportWorkGroupFileReport extends BaseCommand {
  public static commandName = 'workgroup:file_report'
  public static description = 'Export WorkGroup File Paths to Wasabi'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }
  public fileItems: FileItem[] = []

  public async recordFile(folder: FolderItem, status: string) {
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')

    const files = await WorkGroupFile.query()
      .select('name', 'size', 'status')
      .where('work_group_folder_id', folder.id)
      .where('status', status)

    for (let file of files) {
      const item: FileItem = {
        name: file.name,
        size: file.size,
        path: `${folder.path}${file.name}`,
      }
      this.fileItems.push(item)
    }

    this.logger.debug(`Added files in ${folder.name}`)
  }

  public async run() {
    const { default: Case } = await import('App/Models/Case')
    const { default: Env } = await import('@ioc:Adonis/Core/Env')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const caseId = Number((await this.prompt.ask('Enter workgroup caseId')).trim())

    const caseInstance = await Case.find(caseId)

    if (caseInstance === null) {
      this.logger.error(`${caseId} does not exist`)
      await this.exit()
      return
    }

    const parentId = Number((await this.prompt.ask('Enter workgroup folder parent id')).trim())

    const status = await this.prompt.choice('Choose a status', [
      'pending',
      'active',
      'updating',
      'trashed',
      'transferred',
    ])

    try {
      const query = `WITH RECURSIVE work_group_tree (id, parent_id, name, status, path) AS (
      SELECT id, parent_id, name, status, CONCAT(name, '/') as path
      FROM work_group_folders
      WHERE case_id = ? AND parent_id = ?
      UNION ALL
      SELECT t.id, t.parent_id, t.name, t.status, CONCAT(tp.path, t.name, '/')
      FROM work_group_tree AS tp
      JOIN work_group_folders AS t ON tp.id = t.parent_id
    )
    SELECT * FROM work_group_tree WHERE status = ? ORDER BY parent_id`

      const result = await Database.rawQuery(query, [caseId, parentId, status])

      const folderResults = result[0] as FolderResult[]

      this.logger.debug(`Found ${folderResults.length} folders`)

      const folderItems: FolderItem[] = []

      for (let folder of folderResults) {
        folderItems.push({
          id: folder.id,
          name: folder.name,
          path: folder.path.replace('Workgroup/', ''),
        })
      }

      for (let folder of folderItems) {
        await this.recordFile(folder, status)
      }

      this.logger.debug('Creating CSV')

      const fields = ['name', 'size', 'path']

      const parser = new Parser({ fields })
      const csv = parser.parse(this.fileItems)

      const timestamp = DateTime.local().toMillis()
      const exportName = `workgroup-${timestamp}`
      const path = `report/${exportName}.csv`

      const bucket = Env.get('WASABI_WORKSPACE_BUCKET')
      const accessKey = Env.get('WASABI_ACCESS_KEY_ID')
      const secretKey = Env.get('WASABI_SECRET_ACCESS_KEY')

      const s3 = new S3({
        region: 'us-west-1',
        endpoint: 'https://s3.us-west-1.wasabisys.com',
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      })

      this.logger.debug('Uploading CSV to Wasabi')
      const res = await s3.putObject({ Bucket: bucket, Key: path, Body: csv }).promise()

      console.log(res)

      this.logger.success(`Exported WorkGroup Report to ${path} in ${bucket}`)
    } catch (err) {
      console.dir(err)
      this.logger.error(`Unable to complete the script`)
    } finally {
      await this.exit()
    }
  }
}
