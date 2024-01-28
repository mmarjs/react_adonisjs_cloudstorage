import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyOwnershipOfEvidences extends BaseSchema {
  protected tableName = 'evidences'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['case_id'])
      table.dropColumn('case_id')
      table.dropForeign(['custodian_id'])
      table.dropColumn('custodian_id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
        .after('id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.integer('custodian_id').unsigned().notNullable().references('id').inTable('cases')
    })
  }
}
