import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddUniqueUserIdToCompanies extends BaseSchema {
  protected tableName = 'companies'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['user_id'])
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['user_id'])
    })
  }
}
