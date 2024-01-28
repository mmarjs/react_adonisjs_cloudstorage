import cuid from 'cuid'
import slugify from 'slugify'
import { flatten } from 'lodash'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import PersonalFile from 'App/Models/PersonalFile'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
import ZipBuild from 'App/Models/ZipBuild'
import {
  BuildZipFileParams,
  ZipExportFile,
  ZipExportFolder,
  ZipExport,
  WorkGroupFolderItem,
  PersonalFolderItem,
  Either,
} from 'App/types'
import PersonalFolder from 'App/Models/PersonalFolder'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'

export default class ZipBuilder {
  public params: BuildZipFileParams
  public userId: number
  public companyId: number
  public bucket: string
  public fileQtyLimit = 10e6 // 10K files
  public fileSizeLimit = 1.074e11 // 100GB
  public files: ZipExportFile[] = []
  public folders: ZipExportFolder[] = []
  public zipBuildId?: number

  constructor(params: BuildZipFileParams, userId: number, companyId: number) {
    this.params = params
    this.userId = userId
    this.companyId = companyId
    this.bucket = Env.get('WASABI_WORKSPACE_BUCKET')
  }

  public async build(token: string): Promise<Either<{ link: string }>> {
    if (this.params.resource === 'workgroup') {
      await this.setWorkGroupTopLevelFiles()
      await this.processWorkGroupFolders()
    }

    if (this.params.resource === 'personal') {
      await this.setPersonalTopLevelFiles()
      await this.processPersonalFolders()
    }

    if (this.exceedsAllowableSize()) {
      return { error: 'too-big' }
    }

    const zipBuild = await this.saveBuild()

    if (zipBuild === null) {
      return { error: 'failed-to-build-zip' }
    }

    this.zipBuildId = zipBuild.id
    const url = `${Env.get('DOWNLOAD_URL')}/zip/${zipBuild.link}/${token}`
    return { error: null, success: { link: url } }
  }

  public async getWorkGroupFolderTree(parentId: number) {
    const query = `WITH RECURSIVE work_group_tree (id, parent_id, status, path) AS (
      SELECT id, parent_id, status, CONCAT(name, '/') as path
      FROM work_group_folders
      WHERE case_id = ? AND parent_id = ?
      UNION ALL
      SELECT t.id, t.parent_id, t.status, CONCAT(tp.path, t.name, '/')
      FROM work_group_tree AS tp
      JOIN work_group_folders AS t ON tp.id = t.parent_id
    )
    SELECT * FROM work_group_tree WHERE status IN (?) ORDER BY parent_id`
    const result = await Database.rawQuery(query, [
      this.params.resourceId,
      parentId,
      'active',
    ]).reporterData({ name: 'ZipBuilder.getWorkGroupFolderTree' })
    return result[0] as WorkGroupFolderItem[]
  }

  public async getWorkGroupFolderName(folderId: number): Promise<string> {
    const folder = await WorkGroupFolder.query()
      .select('name')
      .where('id', folderId)
      .reporterData({ name: 'ZipBuilder.getWorkGroupFolderName' })
      .firstOrFail()

    return folder.name
  }

  public async setWorkGroupTopLevelFiles() {
    const files = await WorkGroupFile.query()
      .select('path', 'name', 'size')
      .whereIn('id', this.params.files)
      .reporterData({ name: 'ZipBuilder.setWorkGroupTopLevelFiles' })

    for (const file of files) {
      this.files.push({
        wasabiPath: file.path,
        name: file.name,
        size: file.size,
      })
    }
  }

  public async getWorkGroupFiles(folderId: number): Promise<ZipExportFile[]> {
    const exportFiles: ZipExportFile[] = []

    const files = await WorkGroupFile.query()
      .select('path', 'name', 'size')
      .where('work_group_folder_id', folderId)
      .where('status', 'active')
      .reporterData({ name: 'ZipBuilder.getWorkGroupFiles' })

    for (const file of files) {
      exportFiles.push({
        wasabiPath: file.path,
        name: file.name.trim(),
        size: file.size,
      })
    }

    return exportFiles
  }

  public async processWorkGroupFolders() {
    for (const folderId of this.params.folders) {
      try {
        const parentName = await this.getWorkGroupFolderName(folderId)
        const parentFiles = await this.getWorkGroupFiles(folderId)

        this.folders.push({
          path: `${parentName}/`,
          files: parentFiles,
        })

        const tree = await this.getWorkGroupFolderTree(folderId)

        for (let folder of tree) {
          const files = await this.getWorkGroupFiles(folder.id)
          this.folders.push({
            path: `${parentName}/${folder.path}`,
            files: files,
          })
        }
      } catch (_) {
        continue
      }
    }
  }

  public async getPersonalFolderTree(parentId: number) {
    const query = `WITH RECURSIVE personal_tree (id, parent_id, status, path) AS (
      SELECT id, parent_id, status, CONCAT(name, '/') as path
      FROM personal_folders
      WHERE user_id = ? AND parent_id = ?
      UNION ALL
      SELECT t.id, t.parent_id, t.status, CONCAT(tp.path, t.name, '/')
      FROM personal_tree AS tp
      JOIN personal_folders AS t ON tp.id = t.parent_id
    )
    SELECT * FROM personal_tree WHERE status IN (?) ORDER BY parent_id`

    const result = await Database.rawQuery(query, [
      this.params.resourceId,
      parentId,
      'active',
    ]).reporterData({ name: 'ZipBuilder.getPersonalFolderTree' })
    return result[0] as PersonalFolderItem[]
  }

  public async getPersonalFolderName(folderId: number): Promise<string> {
    const folder = await PersonalFolder.query()
      .select('name')
      .where('id', folderId)
      .reporterData({ name: 'ZipBuilder.getPersonalFolderName' })
      .firstOrFail()

    return folder.name
  }

  public async setPersonalTopLevelFiles() {
    const files = await PersonalFile.query()
      .select('path', 'name', 'size')
      .whereIn('id', this.params.files)
      .reporterData({ name: 'ZipBuilder.setPersonalTopLevelFiles' })

    for (const file of files) {
      this.files.push({
        wasabiPath: file.path,
        name: file.name.trim(),
        size: file.size,
      })
    }
  }

  public async getPersonalFiles(folderId: number): Promise<ZipExportFile[]> {
    const exportFiles: ZipExportFile[] = []

    const files = await PersonalFile.query()
      .select('path', 'name', 'size')
      .where('personal_folder_id', folderId)
      .where('status', 'active')
      .reporterData({ name: 'ZipBuilder.getPersonalFiles' })

    for (const file of files) {
      exportFiles.push({
        wasabiPath: file.path,
        name: file.name.trim(),
        size: file.size,
      })
    }

    return exportFiles
  }

  public async processPersonalFolders() {
    for (const folderId of this.params.folders) {
      try {
        const parentName = await this.getPersonalFolderName(folderId)
        const parentFiles = await this.getPersonalFiles(folderId)

        this.folders.push({
          path: `${parentName}/`,
          files: parentFiles,
        })

        const tree = await this.getPersonalFolderTree(folderId)

        for (let folder of tree) {
          const files = await this.getPersonalFiles(folder.id)
          this.folders.push({
            path: `${parentName}/${folder.path}`,
            files: files,
          })
        }
      } catch (_) {
        continue
      }
    }
  }

  public exceedsAllowableSize(): boolean {
    let topLevelFileSize = 0
    let topLevelFileQty = 0
    let folderFileSize = 0
    let folderFileQty = 0

    for (const file of this.files) {
      topLevelFileSize += file.size
      topLevelFileQty += 1
    }

    const files = flatten(this.folders.map((f) => f.files))

    for (const file of files) {
      folderFileSize += file.size
      folderFileQty += 1
    }

    const combinedSize = topLevelFileSize + folderFileSize
    const combinedQty = topLevelFileQty + folderFileQty

    if (combinedSize > this.fileSizeLimit) {
      return true
    }

    if (combinedQty > this.fileQtyLimit) {
      return true
    }

    return false
  }

  public async getParentName(): Promise<string> {
    if (this.params.resource === 'personal') {
      const personal = await PersonalFolder.query()
        .select('name')
        .where('id', this.params.parentId)
        .reporterData({ name: 'ZipBuilder.getParentNamePersonal' })
        .first()

      return personal?.name ?? 'personal'
    }

    const workgroup = await WorkGroupFolder.query()
      .select('name')
      .where('id', this.params.parentId)
      .reporterData({ name: 'ZipBuilder.getParentNameWorkgroup' })
      .first()

    return workgroup?.name ?? 'workgroup'
  }

  public async saveBuild(): Promise<ZipBuild | null> {
    const parentName = await this.getParentName()
    const output: ZipExport = {
      name: `${slugify(parentName)}.zip`,
      files: this.files,
      folders: this.folders,
    }

    const zip = new ZipBuild()
    zip.userId = this.userId
    zip.companyId = this.companyId
    zip.link = cuid()
    zip.input = this.params
    zip.output = output
    await zip.save()

    if (!zip.$isPersisted) {
      return null
    }

    return zip
  }
}
