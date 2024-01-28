import { BaseCommand } from '@adonisjs/core/build/standalone'
import { S3Client, paginateListObjectsV2 } from '@aws-sdk/client-s3'
import ordinal from 'ordinal'

interface InvalidRef {
  fileId: number
  name: string
  path: string
}

export default class ReconcileWorkgroupData extends BaseCommand {
  public static commandName = 'workgroup:reconcile'
  public static description = 'Reconcile WorkGroup Data with Wasabi'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public paths: string[] = []
  public invalids: InvalidRef[] = []

  public async getList() {
    const { default: Env } = await import('@ioc:Adonis/Core/Env')
    const { wasabiConfigV3 } = await import('App/Wasabi/WasabiConfig')

    const config = wasabiConfigV3()

    const paginatorConfig = {
      client: new S3Client(config),
      pageSize: 250,
    }

    const commandConfig = {
      Bucket: Env.get('WASABI_WORKSPACE_BUCKET'),
    }

    const paginator = paginateListObjectsV2(paginatorConfig, commandConfig)

    let counter = 1
    for await (const page of paginator) {
      if (page?.Contents) {
        this.logger.debug(`Checking ${ordinal(counter)} page of objects in wasabi`)

        for (let item of page?.Contents) {
          this.paths.push(item?.Key as string)
        }
        counter = counter + 1
      }
    }
  }

  public async reconcile(status: string) {
    const { default: WorkGroupFile } = await import('App/Models/WorkGroupFile')

    let isEnd = false
    let page = 1

    while (isEnd === false) {
      const files = await WorkGroupFile.query()
        .select('id', 'name', 'path')
        .where('status', status)
        .paginate(page, 50)

      this.logger.debug(`Checking ${ordinal(page)} page of files`)

      for (const file of files) {
        if (!this.paths.includes(file.path)) {
          this.invalids.push({ fileId: file.id, name: file.name, path: file.path })
        }
      }

      if (files.hasMorePages !== true) {
        isEnd = true
        break
      }

      page = page + 1
    }
  }

  public async run() {
    const status = await this.prompt.choice('Choose a status', ['active', 'pending', 'trashed'])

    await this.getList()
    this.logger.debug(`${this.paths.length} objects found in Wasabi`)

    await this.reconcile(status)

    if (this.invalids.length > 0) {
      this.logger.error(`There are ${this.invalids.length} ${status} files to reconcile:`)

      console.log(JSON.stringify(this.invalids))

      await this.exit()
    }

    this.logger.success(`All ${status} files are in wasabi`)
  }
}
