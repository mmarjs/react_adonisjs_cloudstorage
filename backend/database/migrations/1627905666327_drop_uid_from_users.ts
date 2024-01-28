import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropUidFromUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uid')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('uid').after('id')
      table.unique(['uid'])
      table.index('uid')
    })
  }
}
