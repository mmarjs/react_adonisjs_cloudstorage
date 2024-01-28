import Debug from 'debug'
import Env from '@ioc:Adonis/Core/Env'
import Redis from '@ioc:Adonis/Addons/Redis'
import HandlingError from 'App/Models/HandlingError'
import { JobParams, JobName } from 'App/types'

export default class JobDispatcher {
  public static async dispatch(
    actorId: number | null,
    companyId: number | null,
    name: JobName,
    data: any
  ) {
    const debug = Debug('jobs')

    try {
      const params: JobParams = { actorId, companyId, name: name, data: data }

      if (Env.get('NODE_ENV') !== 'testing') {
        debug(`Publishing job ${name}`)
        await Redis.connection('jobs').publish('jobs', JSON.stringify(params))
      }

      return true
    } catch (err) {
      debug(`Failed to publish job ${name}`)
      await HandlingError.create({ userId: actorId, companyId: companyId, event: name, data: data })
      return false
    }
  }
}
