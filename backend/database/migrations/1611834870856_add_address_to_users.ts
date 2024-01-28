import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddAddressToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('zip').nullable().after('role')
      table.string('state').nullable().after('role')
      table.string('street').nullable().after('role')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('zip')
      table.dropColumn('state')
      table.dropColumn('street')
    })
  }
}
