import Debug from 'debug'
import Log from 'App/Lib/Log'
import { JobParams } from 'App/types'
import HandlingError from 'App/Models/HandlingError'
import CreateActiveFilesJob from 'App/Jobs/CreateActiveFilesJob'
import DeleteFileJob from 'App/Jobs/DeleteFileJob'
import DeleteFolderJob from 'App/Jobs/DeleteFolderJob'
import SendEmailJob from 'App/Jobs/SendEmailJob'
import SendSlackJob from 'App/Jobs/SendSlackJob'
import SendShareLinkJob from 'App/Jobs/SendShareLinkJob'
import SendInvitationForNewUser from 'App/Jobs/SendInvitationForNewUser'
import SendInvitationForExistingUser from 'App/Jobs/SendInvitationForNewUser'

export default class JobHandler {
  public params: JobParams

  constructor(params: JobParams) {
    this.params = params
  }

  public async handle(): Promise<boolean> {
    const debug = Debug('jobs')
    debug(`Handling job ${this.params.name} in JobHandler`)

    try {
      switch (this.params.name) {
        case 'create-active-files':
          return await CreateActiveFilesJob.run(this.params)
        case 'delete-file':
          return await DeleteFileJob.run(this.params)
        case 'delete-folder':
          return await DeleteFolderJob.run(this.params)
        case 'send-email':
          return await SendEmailJob.run(this.params)
        case 'send-slack':
          return await SendSlackJob.run(this.params)
        case 'send-share-link':
          return await SendShareLinkJob.run(this.params)
        case 'send-invitation-for-new-user':
          return await SendInvitationForNewUser.run(this.params)
        case 'send-invitation-for-existing-user':
          return await SendInvitationForExistingUser.run(this.params)
        default:
          return false
      }
    } catch (err) {
      await HandlingError.create({
        userId: null,
        companyId: null,
        event: this.params.name,
        data: this.params,
      })
      Log(err, `Failed to manage job ${this.params.name}. \n ${this.params.data}`)
      return false
    }
  }
}
