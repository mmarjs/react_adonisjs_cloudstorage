import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCityToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('city').nullable().after('street')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('city')
    })
  }
}
