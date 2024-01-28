import { actionMailer } from 'App/Mail/Mailgen'
import Env from '@ioc:Adonis/Core/Env'

export default class AccountVerificationEmail {
  public static html(fname: string, token: string): string {
    var email = {
      body: {
        name: fname,
        intro: `Let's get you started!`,
        action: {
          instructions: `To verify the email address you signed up with, please click here:`,
          button: {
            color: '#22BC66',
            text: `Verify Your Account`,
            link: `${Env.get('FRONTEND_URL')}/verify_account/${token}`,
          },
        },
        outro: 'If you have any questions, please contact your company Account Administrator.',
        signature: false,
      },
    }
    var emailBody = actionMailer.generate(email) as string

    return emailBody
  }
}
