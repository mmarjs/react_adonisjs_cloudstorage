import { defaultMailer } from 'App/Mail/Mailgen'

export default class MultipleAccountNoticeEmail {
  public static html(fname: string, companyName: string, role: string, grantor: string): string {
    var email = {
      body: {
        greeting: 'Hello',
        name: fname,
        intro: [
          `Welcome! This is just to let you know that you have been invited to join the Evidence Locker account of ${companyName} by ${grantor} as a ${role}.`,
          'To login into their company account, just login as normal, and select their company name from the dropdown.',
        ],
        outro: 'If you have any questions, please contact your company Account Administrator.',
        signature: false,
      },
    }
    var emailBody = defaultMailer.generate(email) as string

    return emailBody
  }
}
