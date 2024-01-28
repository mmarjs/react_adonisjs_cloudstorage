import PersonalFile from 'App/Models/PersonalFile'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import { FileInfo as Info } from 'App/types'

export default class FileInfo {
  public resource: string
  public resourceId: number

  constructor(resource: string, resourceId: number) {
    this.resource = resource
    this.resourceId = resourceId
  }

  public async info(): Promise<Info> {
    if (this.resource === 'personal') {
      return await this.personal()
    }

    return await this.workgroup()
  }

  private async personal() {
    const file = await PersonalFile.query().where('id', this.resourceId).firstOrFail()
    await file.load('folder', (q) => q.select('name'))

    return {
      filename: file.name,
      path: file.path,
      folderName: file.folder.name,
    }
  }

  private async workgroup() {
    const file = await WorkGroupFile.query().where('id', this.resourceId).firstOrFail()
    await file.load('folder', (q) => q.select('name'))

    return {
      filename: file.name,
      path: file.path,
      folderName: file.folder.name,
    }
  }
}
