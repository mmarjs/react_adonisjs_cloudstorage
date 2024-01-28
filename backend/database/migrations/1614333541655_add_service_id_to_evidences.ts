import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddServiceIdToEvidences extends BaseSchema {
  protected tableName = 'evidences'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table
        .integer('service_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('services')
        .after('custodian_id')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign(['service_id'])
    })
  }
}
