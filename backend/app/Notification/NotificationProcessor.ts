import Debug from 'debug'
import Log from 'App/Lib/Log'
import Role from 'App/Models/Role'
import Pusher from 'App/Lib/Pusher'
import Event from 'App/Models/Event'
import Env from '@ioc:Adonis/Core/Env'
import Slack from 'App/Lib/Slack'
import User from 'App/Models/User'
import NotifyAdmins from 'App/Mail/NotifyAdmins'
import Notification from 'App/Models/Notification'
import { EventName } from 'App/types'
import NotificationMap from 'App/Notification/NotificationMap'
import Database from '@ioc:Adonis/Lucid/Database'
import SendEmailNotification from 'App/Notification/SendEmailNotification'
import Company from 'App/Models/Company'

interface UserChannel {
  user_id: number
  channel: string
}

export default class NotificationProcessor {
  public event: Event
  public name: EventName
  public message: string
  public map: NotificationMap
  public companyChannel: string
  public users: UserChannel[] = []

  constructor(event: Event, message: string) {
    this.event = event
    this.name = event.name
    this.message = message
    this.map = new NotificationMap(this.name)
  }

  public async process(): Promise<boolean> {
    const debug = Debug('events')
    debug('processing notification')

    const company = await Company.query()
      .select('channel')
      .where({ id: this.event.companyId })
      .firstOrFail()

    debug(`setting company channel: ${company.channel}`)
    this.companyChannel = company.channel

    debug('fetching admins')
    const admins = await this.getAdmins()

    debug('fetching non admins')
    const nonAdmins = await this.getNonAdmins()

    this.users = admins.concat(nonAdmins)

    debug('creating notifications')
    const res = await this.createNotifications()

    if (res) {
      debug('sending super admin messages')
      if (this.map.superAdmins().includes(this.name)) {
        await this.sendAdmins()
        await this.sendSlack()
      }
    }

    return res
  }

  public async getAdmins(): Promise<UserChannel[]> {
    return await Role.query()
      .select('roles.user_id', 'users.channel')
      .innerJoin('users', 'roles.user_id', 'users.id')
      .innerJoin('notification_settings as n', (q) => {
        q.on('roles.user_id', '=', 'n.user_id').andOn('roles.company_id', '=', 'n.company_id')
      })
      .where('roles.company_id', this.event.companyId)
      .whereIn('roles.role', User.adminRoles)
      .where('users.status', 'active')
      .where('n.event', this.event.name)
      .whereNot((q) => {
        q.where('n.send_app', false).andWhere('n.send_email', false)
      })
      .reporterData({ name: 'NotificationProcessor.getAdmins' })
      .pojo<UserChannel>()
  }

  public async getNonAdmins(): Promise<UserChannel[]> {
    if (this.map.policyResource() !== 'case') {
      return []
    }

    return await Role.query()
      .distinct('roles.user_id')
      .select('users.channel')
      .innerJoin('permissions as p', (q) => {
        q.on('p.user_id', '=', 'roles.user_id').andOn('p.company_id', '=', 'roles.company_id')
      })
      .innerJoin('users', 'roles.user_id', 'users.id')
      .innerJoin('notification_settings as n', (q) => {
        q.on('roles.user_id', '=', 'n.user_id').andOn('roles.company_id', '=', 'n.company_id')
      })
      .where('p.resource', 'case')
      .where('p.resource_id', Number(this.event?.resourceId))
      .where('users.status', 'active')
      .where('n.event', this.event.name)
      .whereIn('roles.role', User.nonAdminRoles)
      .whereNot((q) => {
        q.where('n.send_app', false).andWhere('n.send_email', false)
      })
      .reporterData({ name: 'NotificationProcessor.getNonAdmins' })
      .pojo<UserChannel>()
  }

  /** Creates the notification in the db and sends emails */
  public async createNotifications(): Promise<boolean> {
    const debug = Debug('events')

    if (this.users.length === 0) {
      debug('No user ids to process')
      return false
    }

    let count = 0
    for (const user of this.users) {
      const notification = await Database.transaction(async (trx) => {
        debug(`Creating notification for ${user.user_id}`)
        const notification = new Notification()
        notification.useTransaction(trx)
        notification.userId = user.user_id
        notification.companyId = this.event.companyId
        notification.eventId = this.event.id
        notification.event = this.name
        notification.message = this.message
        await notification.save()

        return notification
      })

      if (!notification.$isPersisted) {
        debug(`Failed to create notification for event ${this.event.id}`)
        Log(new Error(`Failed to create notification for event ${this.event.id}`))
        continue
      }

      await this.sendPusherNotification(user.channel)
      const email = new SendEmailNotification(notification)
      await email.send()

      count = count + 1
    }

    debug(`${count} notifications created for event ${this.event.name} (${this.event.id})`)
    return this.users.length === count
  }

  public async sendPusherNotification(userChannel: string) {
    const debug = Debug('events')
    try {
      const channel = `${this.companyChannel}-${userChannel}`
      debug(`Sending notification to channel: ${channel}`)
      if (Env.get('NODE_ENV') !== 'testing') {
        const map = new NotificationMap(this.event.name)
        const subject = map.subject()

        await Pusher.trigger(channel, 'notifications', {
          event: this.event.name,
          subject: subject,
          message: this.message,
          resource: this.event.resource,
          resourceId: this.event.resourceId,
        })
      }
    } catch (err) {
      Log(err)
    }
  }

  public async sendSlack() {
    const slack = new Slack(`*Description*: ${this.message}`, 'general')
    await slack.send()
  }

  public async sendAdmins() {
    const notifyAdmins = new NotifyAdmins(this.message)
    await notifyAdmins.notify()
  }
}
