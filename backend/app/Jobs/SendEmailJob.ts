import Log from 'App/Lib/Log'
import Env from '@ioc:Adonis/Core/Env'
import Debug from 'debug'
import Mailgun from 'mailgun-js'
import { MailMessage, JobParams } from 'App/types'

export default class SendEmailJob {
  public static async run(job: JobParams) {
    const data = job.data as MailMessage
    const debug = Debug('jobs')

    debug(`Sending email: ${data.subject}`)

    if (Env.get('NODE_ENV') === 'testing') {
      return true
    }

    const mailgun = Mailgun({
      apiKey: Env.get('MAILGUN_API_KEY'),
      domain: 'mg.evidencelocker.com',
    })

    data.from = 'Evidence Locker <notifications@evidencelocker.com>'

    await mailgun
      .messages()
      .send(data)
      .catch((err) => {
        Log(err)
      })

    return true
  }
}
