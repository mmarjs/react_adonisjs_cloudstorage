import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddUserChannels extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('channel').after('two_factor_method')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('channel')
    })
  }
}
