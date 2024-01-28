import Event from 'App/Models/Event'
import NotificationProcessor from 'App/Notification/NotificationProcessor'
import { FileAccessCategory } from 'App/types'

interface ParamData {
  resource: FileAccessCategory
  numFiles: number
  folderName: string
  caseName: string
}

export default class MultipleFilesDeleted {
  public static async handle(event: Event) {
    const { resource, numFiles, folderName, caseName } = event.data as ParamData

    if (resource === 'workgroup') {
      const user = await Event.getUser(event.id)

      const message = `${user.first_name} ${user.last_name} deleted ${numFiles} files in the ${folderName} folder in the ${caseName} case.`

      const processor = new NotificationProcessor(event, message)
      return await processor.process()
    }

    return true
  }
}
