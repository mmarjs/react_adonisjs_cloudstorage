import { uniq } from 'lodash'
import Log from 'App/Lib/Log'
import FileVariant from 'App/Models/FileVariant'
import FileCategory from 'App/Models/FileCategory'
import { WorkSpaceSearchBody, WorkSpaceSearchQueryConditions } from 'App/types'

export default class WorkSpaceSearchQuery {
  public body: WorkSpaceSearchBody
  public conditions: string[] = []
  public params: { [key: string]: string | number | number[] } = {}

  constructor(body: WorkSpaceSearchBody) {
    this.body = body
  }

  public async search() {
    if (this.body.search_type === 'simple') {
      return this.simple()
    }

    return await this.advanced()
  }

  public simple(): WorkSpaceSearchQueryConditions {
    this.handleStatus().handleFilename()

    return {
      conditions: this.format(),
      params: this.params,
    }
  }

  public async advanced(): Promise<WorkSpaceSearchQueryConditions> {
    this.handleStatus()
      .handleFilename()
      .handleSize()
      .handleLastModified()
      .handleAccess()
      .handleOwner()

    await this.handleFileType()

    return {
      conditions: this.format(),
      params: this.params,
    }
  }

  public format(): string {
    return this.conditions.join(' AND ')
  }

  public handleStatus(): this {
    this.conditions.push('status = :status')
    this.params.status = this.body.status

    return this
  }

  public handleFilename(): this {
    if (this.body?.filename) {
      this.conditions.push('name LIKE :filename')
      this.params.filename = `%${this.body.filename}%`
    }

    return this
  }

  private handleSize(): this {
    if (this.body?.size) {
      if (this.body.size.gt) {
        this.conditions.push('size > :size')
        this.params.size = this.body.size.bytes
      }
      if (this.body.size.lt) {
        this.conditions.push('size < :size')
        this.params.size = this.body.size.bytes
      }
    }

    return this
  }

  private handleLastModified(): this {
    if (this.body?.last_modified) {
      if (this.body?.last_modified?.exactly) {
        this.conditions.push('DATE(last_modified) = :last_modified')
        this.params.last_modified = this.body?.last_modified?.exactly
      }

      if (this.body?.last_modified?.after) {
        this.conditions.push('DATE(last_modified) > :last_modified')
        this.params.last_modified = this.body?.last_modified?.after
      }

      if (this.body?.last_modified?.before) {
        this.conditions.push('DATE(last_modified) < :last_modified')
        this.params.last_modified = this.body?.last_modified?.before
      }

      if (this.body?.last_modified?.between) {
        this.conditions.push(
          'DATE(last_modified) BETWEEN :last_modified_after AND :last_modified_before'
        )
        this.params.last_modified_after = this.body?.last_modified?.between.after
        this.params.last_modified_before = this.body?.last_modified?.between.before
      }
    }

    return this
  }

  private handleAccess(): this {
    if (this.body?.access) {
      this.conditions.push('access = :access')
      this.params.access = this.body?.access
    }

    return this
  }

  private handleOwner(): this {
    if (this.body?.owner) {
      if (this.body.category === 'personal') {
      } else if (this.body?.owner?.owner_id) {
        this.conditions.push('owner_id = :owner_id')
        this.params.owner_id = this.body.owner.owner_id
      }
    }

    return this
  }

  private async handleFileType() {
    try {
      const fileType = this.body.file_type

      if (fileType) {
        if (fileType?.category) {
          await this.getFileTypesByCategory(fileType.category)
        } else if (fileType?.extension) {
          await this.getFileTypesByExt(fileType.extension)
        }
      }

      return this
    } catch (err) {
      Log(err)

      return this
    }
  }

  private async getFileTypesByCategory(value: string) {
    const category = await FileCategory.query().where('category', value).preload('files').first()

    if (category === null) {
      return
    }

    const fileTypeIds = category.files.map((f) => f.id)

    if (fileTypeIds.length === 0) {
      return
    }

    this.conditions.push('file_type_id IN (:file_type_ids)')
    this.params.file_type_ids = `${fileTypeIds.join(',')}`
  }

  private async getFileTypesByExt(value: string) {
    const variants = await FileVariant.query().where('ext', value)
    const fileTypeIds = uniq(variants.map((f) => f.fileTypeId)).join(',')

    if (variants.length === 0) {
      return
    }

    if (fileTypeIds.length === 0) {
      return
    }

    this.conditions.push('file_type_id IN (:file_type_ids)')
    this.params.file_type_ids = `${fileTypeIds}`
  }
}
