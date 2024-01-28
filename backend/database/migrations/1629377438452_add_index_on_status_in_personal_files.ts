import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddIndexOnStatusInPersonalFiles extends BaseSchema {
  protected tableName = 'personal_files'

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
