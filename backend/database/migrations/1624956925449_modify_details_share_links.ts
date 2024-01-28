import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyDetailsShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('parent_id')
      table.renameColumn('resource_id', 'folder_id')
      table.boolean('can_trash').defaultTo(false).after('can_update_password')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('can_trash')
      table.renameColumn('folder_id', 'resource_id')
      table.integer('parent_id').unsigned().nullable()
    })
  }
}
