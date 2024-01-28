import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateAcquisitionServiceItem extends BaseSchema {
  protected tableName = 'acquisition_service_item'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
      table
        .integer('service_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('service_items')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
