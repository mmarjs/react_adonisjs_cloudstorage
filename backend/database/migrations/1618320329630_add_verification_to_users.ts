import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddVerificationToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('verification_token').nullable().after('company_name')
      table.boolean('verified').defaultTo(false).after('company_name')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('verified')
      table.dropColumn('verification_token')
    })
  }
}
