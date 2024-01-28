import { actionMailer } from 'App/Mail/Mailgen'
import Env from '@ioc:Adonis/Core/Env'

export default class PasswordResetEmail {
  public static html(fname: string, token: string): string {
    var email = {
      body: {
        name: fname,
        intro: `Forgot your password? It happens to the best of us!`,
        action: {
          instructions: `To reset your password, please click on the following link. Note, the link is only good for 20 minutes.`,
          button: {
            color: '#22BC66',
            text: `Reset your password`,
            link: `${Env.get('FRONTEND_URL')}/reset_password/${token}`,
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
