import Event from 'App/Models/Event'
import ShareLink from 'App/Models/ShareLink'
import Database from '@ioc:Adonis/Lucid/Database'
import NotificationProcessor from 'App/Notification/NotificationProcessor'
import { FileAccessCategory } from 'App/types'

interface ParamData {
  resource: FileAccessCategory
  folderId: number
  numFiles: number
  shareLinkId?: number
}

interface Folder {
  name: string
  case_name: string
}

export default class ShareLinkFilesUploaded {
  public static async handle(event: Event) {
    const { numFiles, resource, folderId, shareLinkId } = event.data as ParamData

    if (resource === 'workgroup') {
      const user = await Event.getUser(event.id)

      const folder = (await Database.query()
        .from('work_group_folders')
        .select('work_group_folders.name', 'cases.case_name')
        .innerJoin('cases', 'work_group_folders.case_id', 'cases.id')
        .where('work_group_folders.id', folderId)
        .firstOrFail()) as Folder

      const shareLink = await ShareLink.findOrFail(shareLinkId)
      await shareLink.load('grantedBy')

      const actorName = `${user.first_name} ${user.last_name}`
      const grantorName = shareLink.grantedBy.fullName
      const fileInflection = numFiles > 1 ? 'files' : 'file'

      let message = `${actorName} uploaded ${numFiles} ${fileInflection} to shared folder `
      message += `${folder?.name} in the ${folder.case_name} case. `
      message += `The share link was granted by ${grantorName} on ${shareLink.createdAt.toISODate()}.`

      const processor = new NotificationProcessor(event, message)
      return await processor.process()
    }

    return true
  }
}
