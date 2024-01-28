import FileType from 'App/Models/FileType'
import FileVariant from 'App/Models/FileVariant'

export default class FileTypeLookup {
  public filename: string

  constructor(filename: string) {
    this.filename = filename
  }

  public async findType(): Promise<number> {
    const ext = this.getExtension()
    const variant = await FileVariant.query().select('file_type_id').where('ext', ext).first()

    if (!variant) {
      const unknown = await FileType.findByOrFail('name', 'Unknown')
      return unknown.id
    }

    return variant.fileTypeId
  }

  public getExtension(): string {
    const parts = this.filename.split('.')

    if (parts.length === 0) {
      return parts[0]
    }

    const index = parts.length - 1
    return parts[index]
  }
}
