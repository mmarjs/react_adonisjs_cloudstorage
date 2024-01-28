import Debug from 'debug'
import Log from 'App/Lib/Log'
import Event from 'App/Models/Event'
import HandlingError from 'App/Models/HandlingError'
import AccountRegistered from 'App/Event/Handlers/AccountRegistered'
import CaseCreated from 'App/Event/Handlers/CaseCreated'
import CaseArchived from 'App/Event/Handlers/CaseArchived'
import CaseDeleted from 'App/Event/Handlers/CaseDeleted'
import FilesUploaded from 'App/Event/Handlers/FilesUploaded'
import FilesDownloaded from 'App/Event/Handlers/FilesDownloaded'
import MultipleFilesDeleted from 'App/Event/Handlers/MultipleFilesDeleted'
import ShareLinkClicked from 'App/Event/Handlers/ShareLinkClicked'
import ShareLinkCreated from 'App/Event/Handlers/ShareLinkCreated'
import ShareLinkFilesDownloaded from 'App/Event/Handlers/ShareLinkFilesDownloaded'
import ShareLinkFilesUploaded from 'App/Event/Handlers/ShareLinkFilesUploaded'
import UserAddedToCase from 'App/Event/Handlers/UserAddedToCase'
import UserAddedToCompany from 'App/Event/Handlers/UserAddedToCompany'
import UserRemovedFromCase from 'App/Event/Handlers/UserRemovedFromCase'
import UserRemovedCompany from 'App/Event/Handlers/UserRemovedFromCompany'
import UserVerified from 'App/Event/Handlers/UserVerified'

export default class EventHandler {
  public id: number

  constructor(id: number) {
    this.id = id
  }

  public async handle(): Promise<boolean> {
    const debug = Debug('events')

    try {
      const event = await Event.findOrFail(this.id)
      debug(`Handling event ${event.name}`)

      switch (event.name) {
        case 'account-registered':
          return await AccountRegistered.handle(event)
        case 'case-created':
          return await CaseCreated.handle(event)
        case 'case-archived':
          return await CaseArchived.handle(event)
        case 'case-deleted':
          return await CaseDeleted.handle(event)
        case 'files-downloaded':
          return await FilesDownloaded.handle(event)
        case 'files-uploaded':
          return await FilesUploaded.handle(event)
        case 'multiple-files-deleted':
          return await MultipleFilesDeleted.handle(event)
        case 'share-link-created':
          return await ShareLinkCreated.handle(event)
        case 'share-link-clicked':
          return await ShareLinkClicked.handle(event)
        case 'share-link-files-downloaded':
          return await ShareLinkFilesDownloaded.handle(event)
        case 'share-link-files-uploaded':
          return await ShareLinkFilesUploaded.handle(event)
        case 'user-added-to-case':
          return await UserAddedToCase.handle(event)
        case 'user-added-to-company':
          return await UserAddedToCompany.handle(event)
        case 'user-removed-from-case':
          return await UserRemovedFromCase.handle(event)
        case 'user-removed-from-company':
          return await UserRemovedCompany.handle(event)
        case 'user-verified-account':
          return await UserVerified.handle(event)
        default:
          return false
      }
    } catch (err) {
      const event = await Event.find(this.id)
      await HandlingError.create({
        userId: event?.userId,
        companyId: event?.companyId,
        event: event?.name,
        data: { eventId: event?.id },
      })
      Log(err, `Failed to handle event ${this.id}`)
      return false
    }
  }
}
