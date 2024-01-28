import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddTwoFactorFlagsToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('two_factor_method').nullable().after('verification_token')
      table.boolean('is_two_factor_required').defaultTo(false).after('verification_token')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('two_factor_method')
      table.dropColumn('is_two_factor_required')
    })
  }
}
