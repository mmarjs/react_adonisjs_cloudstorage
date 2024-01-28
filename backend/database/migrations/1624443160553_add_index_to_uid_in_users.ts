import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddIndexToUidInUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['uid'], 'idx_uid')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('idx_uid')
    })
  }
}
