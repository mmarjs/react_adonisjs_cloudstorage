import Log from 'App/Lib/Log'
import { MailMessage } from 'App/types'
import JobDispatcher from 'App/Jobs/JobDispatcher'

export default class Email {
  public email: string
  public subject: string
  public html: string

  constructor(email: string, subject: string, html: string) {
    this.email = email
    this.subject = subject
    this.html = html
  }

  public async send() {
    const message: MailMessage = {
      to: this.email,
      subject: this.subject,
      html: this.html,
    }

    await JobDispatcher.dispatch(0, null, 'send-email', message).catch((err) => {
      Log(err)
    })
  }
}
