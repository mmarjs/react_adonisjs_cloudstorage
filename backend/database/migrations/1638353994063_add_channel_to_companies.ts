import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddChannelToCompanies extends BaseSchema {
  protected tableName = 'companies'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('channel').notNullable().after('max_employees').defaultTo('')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('channel')
    })
  }
}
