import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Evidences extends BaseSchema {
  protected tableName = 'evidences'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.integer('custodian_id').unsigned().notNullable().references('id').inTable('custodians')
      table.string('public_evidence_id').notNullable().unique()
      table.enu('status', ['in_progress', 'collected', 'archived'])
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
