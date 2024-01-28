import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PromoCodes extends BaseSchema {
  protected tableName = 'promo_codes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code').unique().notNullable()
      table.timestamp('used_at').nullable()
      table.timestamp('expires_at').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
