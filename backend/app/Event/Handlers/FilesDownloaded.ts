import Event from 'App/Models/Event'
import NotificationProcessor from 'App/Notification/NotificationProcessor'
import { FileAccessCategory } from 'App/types'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'

interface ParamData {
  resource: FileAccessCategory
  numFiles: number
  folderId: number
  shareLinkId: number | null
}

export default class FilesDownloaded {
  public static async handle(event: Event) {
    const { numFiles, resource, folderId } = event.data as ParamData

    if (resource === 'workgroup') {
      const user = await Event.getUser(event.id)
      const folder = await WorkGroupFolder.findOrFail(folderId)
      await folder.load('case')

      const inflection = numFiles > 1 ? 'files' : 'file'

      const message = `${user.first_name} ${user.last_name} downloaded ${numFiles} ${inflection} from the ${folder?.name} folder in the ${folder.case.caseName} case.`

      const processor = new NotificationProcessor(event, message)
      return await processor.process()
    }

    return true
  }
}
