import { DateTime } from 'luxon'
import FileCategory from 'App/Models/FileCategory'
import FileVariant from 'App/Models/FileVariant'
import { BaseModel, column, BelongsTo, belongsTo, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

export default class FileType extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fileCategoryId: number

  @column()
  public name: string

  @column()
  public mime: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => FileCategory)
  public category: BelongsTo<typeof FileCategory>

  @hasMany(() => FileVariant)
  public variants: HasMany<typeof FileVariant>
}
