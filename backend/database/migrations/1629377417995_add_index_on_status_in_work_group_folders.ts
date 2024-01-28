import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddIndexOnStatusInWorkGroupFolders extends BaseSchema {
  protected tableName = 'work_group_folders'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index('status')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('status')
    })
  }
}
