import { DateTime } from 'luxon'
import FileType from 'App/Models/FileType'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class FileVariant extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fileTypeId: number

  @column()
  public ext: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => FileType)
  public file: BelongsTo<typeof FileType>
}
