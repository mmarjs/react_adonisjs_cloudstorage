import Log from 'App/Lib/Log'
import Debug from 'debug'
import User from 'App/Models/User'
import Email from 'App/Mail/Email'
import Company from 'App/Models/Company'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import ShareLink from 'App/Models/ShareLink'
import ShareEmail from 'App/Mail/Emails/ShareInvitationEmail'
import EventDispatcher from 'App/Event/EventDispatcher'
import { JobParams, SpecificUser } from 'App/types'

interface ParamData {
  user: SpecificUser
  linkId: number
  password: string
}

export default class SendShareLinkJob {
  public static async run(job: JobParams) {
    const { user, linkId, password } = job.data as ParamData
    const debug = Debug('jobs')

    debug(`Sending share link job: ${linkId}`)

    try {
      const grantor = await User.findOrFail(user.userId)
      const company = await Company.findOrFail(user.companyId)
      const link = await ShareLink.findOrFail(linkId)

      const email = link.email
      const subject = link.subject
      const msg = link.message
      const name = grantor.fullName
      const companyName = company.name

      const html = ShareEmail.html(name, email, companyName, password, link.link, msg)
      const mail = new Email(email, subject, html)
      await mail.send()

      if (link.resource === 'work_group') {
        const folder = await WorkGroupFolder.query()
          .select('case_id', 'name')
          .preload('case')
          .where({ id: link.folderId })
          .firstOrFail()

        const downloadMessage = `${grantor.fullName} sent a download link to ${link.email} with access to ${folder.case.caseName} files`
        const uploadMessage = `${grantor.fullName} sent an upload link to ${link.email}. This link allows the user to upload files to the ${folder.name} folder in the ${folder.case.caseName} case`
        const message = link.shareType === 'download' ? downloadMessage : uploadMessage

        await EventDispatcher.dispatch({
          userId: grantor.id,
          companyId: company.id,
          name: 'share-link-created',
          resource: 'case',
          resourceId: folder?.caseId,
          data: {
            message: message,
            shareLinkId: link.id,
          },
        })
      }

      return true
    } catch (err) {
      Log(err)
      return false
    }
  }
}
