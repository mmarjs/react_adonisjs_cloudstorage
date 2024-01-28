import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class ShareLinks extends BaseCommand {
  public static commandName = 'backfill:share_links'
  public static description = 'Backfill Share Link Resource Id'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: ShareLink } = await import('App/Models/ShareLink')

    const shareLinks = await ShareLink.query().select(
      'id',
      'granted_by_id',
      'folder_id',
      'resource',
      'resource_id'
    )

    const map = new Map<number, number>()

    for (let link of shareLinks) {
      const resourceId = await ShareLink.getResourceId(
        link.resource,
        link.folderId,
        link.grantedById
      )
      map.set(link.id, resourceId)
    }

    const res = await Database.transaction(async (trx) => {
      for (let link of shareLinks) {
        this.logger.info(`Updating ${link.id}`)
        link.useTransaction(trx)
        link.resourceId = map.get(link.id) ?? 0
        await link.save()

        if (!link.$isPersisted) {
          return false
        }
      }

      return true
    })

    if (!res) {
      this.logger.error('Failed to backfill share link resource id')
      await this.exit()
    }

    this.logger.success(`Successfully backfilled ${shareLinks.length} share links.`)
  }
}
