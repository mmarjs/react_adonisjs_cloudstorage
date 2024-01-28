import Email from 'App/Mail/Email'
import Event from 'App/Models/Event'
import NotifyAdmins from 'App/Mail/NotifyAdmins'
import AccountVerificationEmail from 'App/Mail/Emails/AccountVerificationEmail'

export default class AccountRegistered {
  public static async handle(event: Event) {
    const { firstName, lastName, email, verificationToken } = event.data

    const html = AccountVerificationEmail.html(firstName, verificationToken)
    const sendEmail = new Email(email, 'Verify Your Account', html)
    await sendEmail.send()

    const notifyAdmins = new NotifyAdmins(
      `${firstName} ${lastName} (${email}) has registered as an account owner.`
    )

    await notifyAdmins.notify()

    return true
  }
}
