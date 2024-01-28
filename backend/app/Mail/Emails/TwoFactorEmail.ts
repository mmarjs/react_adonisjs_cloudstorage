import { defaultMailer } from 'App/Mail/Mailgen'

export default class TwoFactorEmail {
  public static html(fname: string, token: string): string {
    var email = {
      body: {
        name: fname,
        intro: [
          'Here is your one time pin to log in to Evidence Locker:',
          `${token}`,
          'Please note: It is only valid for 5 minutes',
        ],
        outro: 'If you have any questions, please contact your company Account Administrator.',
        signature: false,
      },
    }
    var emailBody = defaultMailer.generate(email) as string

    return emailBody
  }
}
