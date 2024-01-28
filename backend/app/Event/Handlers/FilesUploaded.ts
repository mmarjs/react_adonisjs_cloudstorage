import Event from 'App/Models/Event'
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

export default class FilesUploaded {
  public static async handle(event: Event) {
    const { numFiles, resource, folderId } = event.data as ParamData

    if (resource === 'workgroup') {
      const user = await Event.getUser(event.id)
      const folder = (await Database.query()
        .from('work_group_folders')
        .select('work_group_folders.name', 'cases.case_name')
        .innerJoin('cases', 'work_group_folders.case_id', 'cases.id')
        .where('work_group_folders.id', folderId)
        .firstOrFail()) as Folder

      const inflection = numFiles > 1 ? 'files' : 'file'
      const message = `${user.first_name} ${user.last_name} uploaded ${numFiles} ${inflection} to the ${folder.name} folder in the ${folder.case_name} case.`

      const processor = new NotificationProcessor(event, message)
      return await processor.process()
    }

    return true
  }
}
