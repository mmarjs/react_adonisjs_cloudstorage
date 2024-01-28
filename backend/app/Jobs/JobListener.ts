import Debug from 'debug'
import { BaseCommand } from '@adonisjs/core/build/standalone'
import { JobParams } from 'App/types'

export default class JobListener extends BaseCommand {
  public static commandName = 'jobs:listen'
  public static description = 'Listen for Jobs'

  public static settings = {
    loadApp: true,
    stayAlive: true,
  }

  public async run() {
    const { default: Log } = await import('App/Lib/Log')
    const { default: JobHandler } = await import('App/Jobs/JobHandler')
    const { default: Redis } = await import('@ioc:Adonis/Addons/Redis')
    const { default: HandlingError } = await import('App/Models/HandlingError')

    this.logger.debug('Starting up Job Listener')
    const debug = Debug('jobs')

    Redis.connection('jobs').subscribe('jobs', (data: string) => {
      const params = JSON.parse(data) as JobParams

      debug(`Handling ${params.name} in JobListener`)
      const handler = new JobHandler(params)

      handler
        .handle()
        .then((res) => {
          if (res) {
            this.logger.action('job').succeeded(params.name)
          } else {
            this.logger.action('job').failed(params.name, 'Unknown reason')
          }
        })
        .catch((err) => {
          HandlingError.create({
            userId: params.actorId,
            companyId: params.companyId,
            event: params.name,
            data: params,
          })
            .then(() => {
              this.logger.error(`Saved HandlingError for job ${params.name}`)
            })
            .catch((err) => {
              this.logger.action('job').failed(params.name, String(err))
            })
            .finally(() => {
              Log(err)
            })
        })
    })

    process.on('unhandledRejection', (err: object) => {
      this.logger.error(JSON.stringify(err))
    })

    process.on('uncaughtException', (err) => {
      Log(err)
      this.logger.error(err.message)
    })
  }
}
