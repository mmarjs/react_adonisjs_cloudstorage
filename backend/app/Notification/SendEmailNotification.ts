import Debug from 'debug'
import Log from 'App/Lib/Log'
import Email from 'App/Mail/Email'
import Notification from 'App/Models/Notification'
import NotificationMap from 'App/Notification/NotificationMap'
import NotificationSetting from 'App/Models/NotificationSetting'
import NotificationEmail from 'App/Mail/Emails/NotificationEmail'

export default class SendEmailNotification {
  public notification: Notification

  constructor(notification: Notification) {
    this.notification = notification
  }

  public async send() {
    const userId = this.notification.userId
    const company = this.notification.companyId
    const event = this.notification.event
    const setting = await NotificationSetting.byName(userId, company, event)
    const debug = Debug('events')

    if (setting === null) {
      Log(new Error(`Failed to fetch settings for notification ${this.notification.id}`))
      return
    }

    if (setting.sendEmail) {
      try {
        debug(`Sending email notification for notification # ${this.notification.id}`)
        const user = await Notification.getUser(this.notification.id)

        const html = NotificationEmail.html(user?.first_name, this.notification.message)
        const map = new NotificationMap(this.notification.event)
        const subject = map.subject()

        const email = new Email(user.email, subject, html)
        await email.send()
      } catch (err) {
        Log(err)
      }
    }
  }
}
