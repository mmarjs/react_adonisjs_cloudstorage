import Email from 'App/Mail/Email'
import Admin from 'App/Models/Admin'
import AdminUserActionEmail from 'App/Mail/Emails/AdminUserActionEmail'

export default class NotifyAdmins {
  public action: string

  constructor(action: string) {
    this.action = action
  }

  public async notify() {
    const admins = await Admin.query().orderBy('email', 'asc')

    for (let admin of admins) {
      const body = AdminUserActionEmail.html(admin.firstName, this.action)
      const email = new Email(admin.email, 'Admin Notification', body)
      await email.send()
    }
  }
}
