import { actionMailer } from 'App/Mail/Mailgen'

export default class UserInvitationEmail {
  public static html(name: string, company: string, grantor: string, link: string): string {
    var email = {
      body: {
        greeting: 'Hello',
        name: name,
        intro: [
          `Welcome!  You have been invited to join the Evidence Locker account of ${company} by ${grantor}.`,
        ],
        action: {
          instructions: `To accept this invitation, please click on the button below to activate your account and create your password. This link is unique to you and must be used within 7 days.`,
          button: {
            color: '#22BC66',
            text: `Accept Invitation`,
            link: link,
          },
        },
        outro: [
          'Trouble with the above button?  You can copy and paste the following URL into your browser:',
          link,
        ],
        signature: false,
      },
    }
    var emailBody = actionMailer.generate(email) as string

    return emailBody
  }
}
