import Log from 'App/Lib/Log'
import { DeleteFileJobParams, JobParams } from 'App/types'
import deletPersonalTrashedFile from 'App/Personal/DeleteTrashedFile'
import deleteWorkGroupTrashedFile from 'App/WorkGroup/DeleteTrashedFile'

export default class DeleteFileJob {
  public static async run(job: JobParams) {
    const params = job.data as DeleteFileJobParams

    try {
      if (params.category === 'personal') {
        const res = await deletPersonalTrashedFile(params.id)

        if (!res) {
          throw new Error()
        }
      }

      if (params.category === 'workgroup') {
        const res = await deleteWorkGroupTrashedFile(params.id)

        if (!res) {
          throw new Error()
        }
      }

      return true
    } catch (err) {
      Log(err)
      return false
    }
  }
}
