import UpdateZipBuild from 'App/Files/UpdateZipBuild'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import FileInfo from 'App/Files/FileInfo'
import { getSignedDownloadUrl } from 'App/Wasabi/Wasabi'
import ZipBuilder from 'App/Files/ZipBuilder'
import { isEmpty } from 'lodash'
import ZipBuild from 'App/Models/ZipBuild'
import Authorization from 'App/Auth/Authorization'
import JobDispatcher from 'App/Jobs/JobDispatcher'
import {
  ActivateFilesValidator,
  DownloadFileValidator,
  DeleteFileValidator,
  BuildZipValidator,
} from 'App/Files/Validators'
import {
  ActiveFileParams,
  DeleteFileJobParams,
  DownloadFileParams,
  BuildZipFileParams,
  EventName,
} from 'App/types'
import { getCompanyUserIdsByToken, isShareLinkUser } from 'App/Lib/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EventDispatcher from 'App/Event/EventDispatcher'

export default class FilesController {
  public async singleDownload({ request, response, token }: HttpContextContract) {
    await request.validate(DownloadFileValidator)
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const isShareUser = await isShareLinkUser(token)
    const { resource, id, shareLinkId } = request.all() as DownloadFileParams

    if (resource === 'workgroup') {
      const file = await WorkGroupFile.query()
        .select('work_group_folders.case_id as caseId', 'work_group_folders.id as folderId')
        .innerJoin(
          'work_group_folders',
          'work_group_files.work_group_folder_id',
          'work_group_folders.id'
        )
        .where('work_group_files.id', id)
        .pojo<{ caseId: number; folderId: number }>()
        .firstOrFail()

      const caseId = file.caseId
      const folderId = file.folderId

      if (caseId === null) {
        return response.forbidden('invalid-folder-id')
      }
      const authorization = new Authorization(userId, companyId, 'read', 'case', caseId)
      const isAuthorized = await authorization.isAuthorized()

      if (!isAuthorized) {
        return response.forbidden('not-authorized-to-download')
      }

      const eventName: EventName = isShareUser ? 'share-link-files-downloaded' : 'files-downloaded'

      await EventDispatcher.dispatch({
        userId,
        companyId,
        name: eventName,
        resource: 'case',
        resourceId: caseId,
        data: { resource, shareLinkId, numFiles: 1, folderId: folderId },
      })
    }

    const fileInfo = new FileInfo(resource, id)
    const info = await fileInfo.info()
    const url = await getSignedDownloadUrl(resource, info)

    if (url.length === 0) {
      return response.badRequest('could not download file')
    }

    return response.ok({
      filename: info.filename,
      url: url,
    })
  }

  public async buildZip({ request, response, token }: HttpContextContract) {
    await request.validate(BuildZipValidator)
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const isShareUser = await isShareLinkUser(token)
    const params = request.all() as BuildZipFileParams

    if (params.resource === 'workgroup') {
      const authorization = new Authorization(userId, companyId, 'read', 'case', params.resourceId)
      const isAuthorized = await authorization.isAuthorized()

      if (!isAuthorized) {
        return response.forbidden('not-authorized-to-download')
      }
    }

    const builder = new ZipBuilder(params, userId, companyId)
    const { error, success } = await builder.build(token ?? '')

    if (error !== null) {
      return response.badRequest({ error: error })
    }

    if (params.resource === 'workgroup') {
      const eventName: EventName = isShareUser ? 'share-link-files-downloaded' : 'files-downloaded'

      const caseId = await WorkGroupFolder.getCaseId(params.parentId)

      await EventDispatcher.dispatch({
        userId,
        companyId,
        name: eventName,
        resource: 'case',
        resourceId: caseId ?? undefined,
        data: {
          resource: params.resource,
          folderId: params.parentId,
          numFiles: builder.files.length,
          shareLinkId: params.shareLinkId,
          caseId: caseId,
        },
      })
    }

    return response.ok({ success })
  }

  public async zipOutput({ response, params, token }: HttpContextContract) {
    const { userId } = await getCompanyUserIdsByToken(token)
    const link = params.link

    if (isEmpty(link)) {
      return response.badRequest({ error: 'invalid-link' })
    }

    const build = await ZipBuild.query()
      .select('id', 'link', 'output', 'downloaded_at')
      .where('link', link)
      .first()

    if (build === null) {
      return response.badRequest({ error: 'failed-to-fetch-output' })
    }

    if (build.downloadedAt !== null) {
      return response.badRequest({ error: 'already-downloaded' })
    }

    await UpdateZipBuild(build.id, userId)

    const { name, files, folders } = build.output

    return response.ok({ name, folders, files })
  }

  public async createFiles({ request, response, token }: HttpContextContract) {
    await request.validate(ActivateFilesValidator)
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const isShareUser = await isShareLinkUser(token)
    const params = request.all() as ActiveFileParams

    const jobParams = {
      userId: userId,
      companyId: companyId,
      fileParams: params,
      isShareUser,
    }

    await JobDispatcher.dispatch(userId, companyId, 'create-active-files', jobParams)

    return response.ok({ status: 'ok' })
  }

  public async deleteFiles({ request, response, token }: HttpContextContract) {
    await request.validate(DeleteFileValidator)
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const params = request.all() as DeleteFileJobParams

    if (params.category === 'workgroup') {
      let caseId: null | number = null

      if (params.type === 'file') {
        caseId = await WorkGroupFile.getCaseId(params.id)
      } else if (params.type === 'folder') {
        caseId = await WorkGroupFolder.getCaseId(params.id)
      }

      if (caseId === null) {
        return response.forbidden('invalid-folder-id')
      }

      const authorization = new Authorization(userId, companyId, 'trash', 'case', caseId)
      const isAuthorized = await authorization.isAuthorized()

      if (!isAuthorized) {
        return response.forbidden('not-authorized-to-trash')
      }
    }

    if (params.type === 'file') {
      await JobDispatcher.dispatch(userId, companyId, 'delete-file', params)
    } else {
      await JobDispatcher.dispatch(userId, companyId, 'delete-folder', {
        userId,
        companyId,
        params,
      })
    }

    response.ok({ status: 'ok' })
  }
}
