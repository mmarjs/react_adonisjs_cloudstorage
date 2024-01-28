import Log from 'App/Lib/Log'
import { DeleteFileJobParams, JobParams } from 'App/types'
import deletePersonalTrashedFolder from 'App/Personal/DeleteTrashedFolder'
import deleteWorkGroupTrashedFolder from 'App/WorkGroup/DeleteTrashedFolder'

interface ParamsData {
  userId: number
  companyId: number
  params: DeleteFileJobParams
}

export default class DeleteFolderJob {
  public static async run(job: JobParams) {
    const { params } = job.data as ParamsData
    const { type, category, id } = params

    try {
      if (type === 'file') {
        throw new Error('Cannot process file in this job')
      }

      if (category === 'personal') {
        await deletePersonalTrashedFolder(id)
      }

      if (category === 'workgroup') {
        await deleteWorkGroupTrashedFolder(id)
      }

      return true
    } catch (err) {
      Log(new Error(`Failed to delete ${category} ${id}`))
      return false
    }
  }
}
