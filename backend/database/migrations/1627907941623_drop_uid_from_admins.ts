import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropUidFromAdmins extends BaseSchema {
  protected tableName = 'admins'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uid')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('uid').after('id')
    })
  }
}
