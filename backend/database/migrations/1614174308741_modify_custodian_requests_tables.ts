import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyCustodianRequestsTables extends BaseSchema {
  protected tableName = 'custodian_requests'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('before')
      table.dropColumn('after')
      table.dropColumn('finished_at')
      table.dropColumn('cloud_account_username')
      table.dropColumn('acquisition_type')
      table.string('email').notNullable().after('custodian_id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
        .after('custodian_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email')
      table.dropForeign(['acquisition_id'], 'custodian_requests_acquisitions_id_foreign')
      table.dateTime('before').nullable()
      table.dateTime('after').nullable()
      table.string('cloud_account_username')
      table.timestamp('finished_at').nullable()
      table.string('acquisition_type').notNullable()
    })
  }
}
