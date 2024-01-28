import { defaultMailer } from 'App/Mail/Mailgen'

export default class NotificationEmail {
  public static html(fname: string, message: string): string {
    var email = {
      body: {
        name: fname,
        intro: message,
        outro: 'If you have any questions, please contact your company Account Administrator.',
        signature: false,
      },
    }
    var emailBody = defaultMailer.generate(email) as string

    return emailBody
  }
}
