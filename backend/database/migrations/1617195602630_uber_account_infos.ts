import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberAccountInfos extends BaseSchema {
  protected tableName = 'uber_account_infos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
      table.string('picture')
      table.string('first_name')
      table.string('last_name')
      table.string('uuid')
      table.string('email')
      table.boolean('mobile_verified')
      table.string('promo_code')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
