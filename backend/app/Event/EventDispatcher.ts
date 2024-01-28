import Log from 'App/Lib/Log'
import Debug from 'debug'
import Event from 'App/Models/Event'
import Env from '@ioc:Adonis/Core/Env'
import Redis from '@ioc:Adonis/Addons/Redis'
import Database from '@ioc:Adonis/Lucid/Database'
import HandlingError from 'App/Models/HandlingError'
import { EventParams, EventDispatchParams } from 'App/types'

export default class EventDispatcher {
  public static async dispatch(params: EventDispatchParams) {
    const debug = Debug('events')
    debug(`Saving ${params.name} in events table`)
    const name = params.name

    try {
      const event = await Database.transaction(async (trx) => {
        const event = new Event()
        event.useTransaction(trx)
        event.userId = params.userId
        event.companyId = params.companyId
        event.resource = params?.resource ?? null
        event.resourceId = params?.resourceId ?? null
        event.name = params.name

        if (params?.data) {
          event.data = params.data
        }

        await event.save()

        if (!event.$isPersisted) {
          return null
        }

        return event
      })

      if (event === null) {
        Log(new Error(`Could not create event ${params.name}`))
        return false
      }

      if (Env.get('NODE_ENV') !== 'testing') {
        const params: EventParams = { id: event.id, name: name }
        await Redis.connection('events').publish('events', JSON.stringify(params))
      }

      debug(`Publishing event ${event.name}: ${event.id}`)

      return true
    } catch (err) {
      debug(`Publishing to publish event ${name}`)

      await HandlingError.create({
        userId: params.userId,
        companyId: params.companyId,
        event: params.name,
        data: params?.data ?? {},
      })

      return false
    }
  }
}
