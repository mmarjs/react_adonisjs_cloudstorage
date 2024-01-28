import Event from 'App/Models/Event'
import ShareLink from 'App/Models/ShareLink'
import NotificationProcessor from 'App/Notification/NotificationProcessor'
import { FileAccessCategory } from 'App/types'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'

interface ParamData {
  resource: FileAccessCategory
  folderId: number
  numFiles: number
  shareLinkId?: number
}

export default class ShareLinkFilesDownloaded {
  public static async handle(event: Event) {
    const { numFiles, resource, shareLinkId, folderId } = event.data as ParamData

    if (resource === 'workgroup') {
      const user = await Event.getUser(event.id)
      const folder = await WorkGroupFolder.findOrFail(folderId)
      await folder.load('case')

      const shareLink = await ShareLink.findOrFail(shareLinkId)
      await shareLink.load('grantedBy')

      const actorName = `${user.first_name} ${user.last_name}`
      const grantorName = shareLink.grantedBy.fullName
      const fileInflection = numFiles > 1 ? 'files' : 'file'

      let message = `${actorName} downloaded ${numFiles} ${fileInflection} from shared folder `
      message += `${folder?.name} in the ${folder.case.caseName} case. `
      message += `The share link was granted by ${grantorName} on ${shareLink.createdAt.toISODate()}.`

      const processor = new NotificationProcessor(event, message)
      return await processor.process()
    }

    return true
  }
}
