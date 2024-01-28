import { defaultMailer } from 'App/Mail/Mailgen'

export default class AdminUserActionEmail {
  public static html(name: string, action: string): string {
    var email = {
      body: {
        name: name,
        intro: action,
        signature: false,
      },
    }
    var emailBody = defaultMailer.generate(email) as string

    return emailBody
  }
}
