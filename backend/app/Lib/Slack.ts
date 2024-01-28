import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { IncomingWebhook } from '@slack/webhook'

type Channel = 'general' | 'errors'

export default class Slack {
  public message: string
  public channel: Channel

  constructor(message: string, channel: Channel) {
    this.message = message
    this.channel = channel
  }

  public async send() {
    const url = this.getWebhookUrl(this.channel)
    const webhook = new IncomingWebhook(url)
    const emoji = this.getEmoji(this.channel)
    const env = Env.get('NODE_ENV')
    const fullMessage = `${emoji} *Location:* ${env} \n ${this.message}`

    if (env !== 'testing') {
      await webhook.send(fullMessage).catch((err) => {
        Logger.error(err?.message)
      })
    } else {
      if (Env.get('SHOW_SLACK') === true) {
        Logger.info(fullMessage)
      }
    }
  }

  private getWebhookUrl(channel: Channel) {
    const channels = new Map<string, string>()
    channels.set('general', Env.get('SLACK_GENERAL_WEBHOOK'))
    channels.set('errors', Env.get('SLACK_ERRORS_WEBHOOK'))

    if (channels.has(channel)) {
      return channels.get(channel) as string
    }

    return channels.get('general') as string
  }

  private getEmoji(channel: Channel) {
    const channels = new Map<string, string>()
    channels.set('general', ':postbox:')
    channels.set('errors', ':fire:')

    if (channels.has(channel)) {
      return channels.get(channel) as string
    }

    return channels.get('general') as string
  }
}
