import { BaseCommand } from '@adonisjs/core/build/standalone'
import { toSafeInteger } from 'lodash'
import Debug from 'debug'
import { EventParams } from 'App/types'

export default class EventListener extends BaseCommand {
  public static commandName = 'events:listen'
  public static description = 'Event Listener'

  public static settings = {
    loadApp: true,
    stayAlive: true,
  }

  public async run() {
    const { default: Log } = await import('App/Lib/Log')
    const { default: EventHandler } = await import('App/Event/EventHandler')
    const { default: Redis } = await import('@ioc:Adonis/Addons/Redis')
    const { default: Event } = await import('App/Models/Event')
    const { default: HandlingError } = await import('App/Models/HandlingError')

    this.logger.debug('Starting up Event Handler')
    const debug = Debug('events')

    Redis.connection('events').subscribe('events', (data: string) => {
      const params = JSON.parse(data) as EventParams

      debug(`Handling ${params.name}`)
      const eventId = toSafeInteger(params.id)
      const handler = new EventHandler(eventId)

      handler
        .handle()
        .then((res) => {
          if (res) {
            this.logger.action('event').succeeded(params.name)
          }
        })
        .catch((err) => {
          Event.find(eventId).then((event) => {
            HandlingError.create({
              userId: event?.userId,
              companyId: event?.companyId,
              event: event?.name,
              data: params,
            })
              .then(() => {
                this.logger.error(`Saved HandlingError for event ${eventId}`)
              })
              .catch((err) => {
                this.logger.action('event').failed(params.name, String(err))
              })
              .finally(() => {
                Log(err)
              })
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
