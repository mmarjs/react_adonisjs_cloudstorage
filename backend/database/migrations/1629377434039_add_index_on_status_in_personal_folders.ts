import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddIndexOnStatusInPersonalFolders extends BaseSchema {
  protected tableName = 'personal_folders'

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
