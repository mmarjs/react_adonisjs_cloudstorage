import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropParentIdShareResources extends BaseSchema {
  protected tableName = 'share_resources'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('parent_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('parent_id').unsigned().nullable()
    })
  }
}
