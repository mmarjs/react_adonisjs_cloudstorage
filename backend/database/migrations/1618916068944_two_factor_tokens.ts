import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TwoFactorTokens extends BaseSchema {
  protected tableName = 'two_factor_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.string('secret').notNullable().unique()
      table.string('token').notNullable().unique()
      table.string('method').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
