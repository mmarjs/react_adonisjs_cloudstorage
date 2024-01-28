import AWS from 'aws-sdk'
import S3 from 'aws-sdk/clients/s3'
import { BaseCommand } from '@adonisjs/core/build/standalone'

interface Folder {
  id: number
  case_id: number
  parent_id: number
  name: string
  files: File[]
}

interface File {
  name: string
  remote_path: string
  size: number
  status: 'active'
  date_created: string
  last_modified: string
  last_accessed: string
}

export default class BulkImportWorkGroupData extends BaseCommand {
  public static commandName = 'workgroup:bulk_import'
  public static description = 'Parse an export from the batch import tool'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Env } = await import('@ioc:Adonis/Core/Env')
    const { default: Log } = await import('App/Lib/Log')
    const { default: Case } = await import('App/Models/Case')
    const { default: User } = await import('App/Models/User')
    const { default: WorkGroupFolder } = await import('App/Models/WorkGroupFolder')
    const { initializeFolder, finalizeFolder, findCurrentIds } = await import(
      'App/Files/BulkImport'
    )

    const caseId = Number((await this.prompt.ask('Enter caseId of import')).trim())
    const userId = Number((await this.prompt.ask('Enter userId to act as')).trim())

    const caseInstance = await Case.findOrFail(caseId)

    const user = await User.query()
      .select('id', 'first_name', 'last_name')
      .where('id', userId)
      .firstOrFail()

    const rootFolder = await WorkGroupFolder.query()
      .where('case_id', caseId)
      .where('parent_id', 0)
      .firstOrFail()

    const name = (await this.prompt.ask('Enter the name of the exported job file')).trim()
    const path = `bulk-import/${name}`

    await this.prompt.confirm(
      `Go ahead and import this batch into the ${caseInstance.caseName} case?`
    )

    try {
      const bucket = Env.get('WASABI_WORKSPACE_BUCKET')
      const accessKey = Env.get('WASABI_ACCESS_KEY_ID')
      const secretKey = Env.get('WASABI_SECRET_ACCESS_KEY')

      const s3 = new AWS.S3({
        region: 'us-west-1',
        endpoint: 'https://s3.us-west-1.wasabisys.com',
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      })

      const res = await s3.getObject({ Bucket: bucket, Key: path }).promise()
      const body = res.Body

      if (body === undefined) {
        this.logger.error('Cannot fetch export')
        await this.exit()
      }

      const input = body as S3.Body
      const data = JSON.parse(input.toString()) as Folder[][]
      const folders: Folder[] = []

      for (let items of Object.values(data)) {
        for (let item of items) {
          folders.push(item)
        }
      }

      const registry = new Map<number, number>()

      for (let folder of folders) {
        const res = await initializeFolder(folder, user, caseInstance, this.logger)
        registry.set(folder.id, res.id)
      }

      let errors = 0
      let success = 0

      for (let folder of folders) {
        const { currentFolderId, parentId } = findCurrentIds(folder, registry, rootFolder.id)
        const isSaved = await finalizeFolder(folder, currentFolderId, parentId, this.logger)

        if (!isSaved) {
          errors++
        } else {
          success++
        }
      }

      if (errors > 0) {
        this.logger.info(`There were ${errors} number of errors.`)
      } else {
        this.logger.success(`${success} folders were imported with all their files`)
      }
    } catch (err) {
      Log(err)
      this.logger.error(err?.message ?? 'unknown error')
    } finally {
      await this.exit()
    }
  }
}
