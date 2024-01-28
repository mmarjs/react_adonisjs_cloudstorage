import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Acquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('custodian_id').unsigned().notNullable().references('id').inTable('custodians')
      table.string('cloud_account_username')
      table.string('token').notNullable().unique()
      table.string('acquisition_type').notNullable()
      table.dateTime('before').nullable()
      table.dateTime('after').nullable()
      table.enu('status', ['in_progress', 'finished', 'archived']).notNullable()
      table.timestamps(true)
      table.timestamp('finished_at').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
