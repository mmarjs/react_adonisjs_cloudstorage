import Debug from 'debug'
import Log from 'App/Lib/Log'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import { ActiveFileParams, EventName, JobParams } from 'App/types'
import CreateActiveFiles from 'App/Files/CreateActiveFiles'
import EventDispatcher from 'App/Event/EventDispatcher'

interface ParamData {
  userId: number
  companyId: number
  fileParams: ActiveFileParams
  isShareUser: boolean
}

export default class CreateActiveFilesJob {
  public static async run(job: JobParams) {
    const { userId, companyId, fileParams, isShareUser } = job.data as ParamData
    const debug = Debug('jobs')

    if (fileParams.files.length === 0) {
      return false
    }

    try {
      debug(`Creating ${fileParams.files.length} files in CreateActiveFilesJob`)

      const actor = new CreateActiveFiles(userId, fileParams)
      const { error } = await actor.create()

      if (error !== null) {
        throw new Error(error)
      }

      const eventName: EventName = isShareUser ? 'share-link-files-uploaded' : 'files-uploaded'
      const eventParams = {
        resource: fileParams.resource,
        folderId: fileParams.folderId,
        numFiles: fileParams.files.length,
        shareLinkId: fileParams?.shareLinkId,
      }

      debug(`Dispatching event in CreateActiveFilesJob`)

      if (fileParams.resource === 'workgroup') {
        const folder = await WorkGroupFolder.query()
          .select()
          .where({ id: fileParams.folderId })
          .first()

        await EventDispatcher.dispatch({
          userId,
          companyId,
          name: eventName,
          resource: 'case',
          resourceId: folder?.caseId,
          data: eventParams,
        })
      }
      return true
    } catch (err) {
      Log(err)
      return false
    }
  }
}
