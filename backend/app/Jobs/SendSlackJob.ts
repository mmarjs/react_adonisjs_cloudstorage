import { JobParams } from 'App/types'
import Slack from 'App/Lib/Slack'
import Env from '@ioc:Adonis/Core/Env'
import Debug from 'debug'

export default class SendSlackJob {
  public static async run(job: JobParams) {
    const data = job.data as { message: string }
    const debug = Debug('jobs')

    debug(`Sending slack`)
    if (Env.get('NODE_ENV') !== 'testing') {
      const slack = new Slack(data.message, 'general')
      await slack.send()
    }

    return true
  }
}
