import { DateTime } from 'luxon'
import FileType from 'App/Models/FileType'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

export default class FileCategory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public category: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => FileType)
  public files: HasMany<typeof FileType>
}
