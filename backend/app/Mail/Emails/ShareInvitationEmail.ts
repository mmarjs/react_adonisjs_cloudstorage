import { actionMailer } from 'App/Mail/Mailgen'
import Env from '@ioc:Adonis/Core/Env'

export default class ShareInvitationEmail {
  public static html(
    name: string,
    userName: string,
    company: string,
    password: string,
    link: string,
    msg: string
  ): string {
    const message = msg.split('\n')

    var email = {
      body: {
        name: 'User',
        intro: [`${name} at ${company} shared some files with you on Evidence Locker.`, ...message],
        table: {
          title: 'Share Details',
          data: [{ username: userName, password: password }],
        },
        action: {
          instructions:
            'To access the files, just click on the following link and use the login details provided above.',
          button: {
            color: '#22BC66',
            text: `Log In`,
            link: `${Env.get('FRONTEND_URL')}/share/${link}`,
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
