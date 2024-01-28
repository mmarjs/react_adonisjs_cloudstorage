import Event from 'App/Models/Event'
import ShareLink from 'App/Models/ShareLink'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import NotificationProcessor from 'App/Notification/NotificationProcessor'

interface ParamData {
  shareLinkId: number
}

export default class ShareLinkClicked {
  public static async handle(event: Event) {
    const { shareLinkId } = event.data as ParamData
    const shareLink = await ShareLink.findOrFail(shareLinkId)
    await shareLink.load('grantedBy')

    if (shareLink.resource === 'work_group') {
      const folder = await WorkGroupFolder.findOrFail(shareLink.folderId)
      await folder.load('case', (q) => q.select('case_name'))

      const direction = shareLink.shareType === 'download' ? 'from' : 'to'

      let message = `The share ${shareLink.shareType} link granted by ${shareLink.grantedBy.fullName} and sent to `
      message += `${shareLink.email}, has been accessed. This link allows the user to ${shareLink.shareType} files `
      message += `${direction} the ${folder.name} folder in the ${folder.case.caseName} case.`

      const processor = new NotificationProcessor(event, message)
      return await processor.process()
    }

    return false
  }
}
