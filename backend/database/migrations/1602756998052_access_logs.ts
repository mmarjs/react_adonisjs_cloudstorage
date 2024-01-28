import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccessLogs extends BaseSchema {
  protected tableName = 'access_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.integer('evidence_id').unsigned().notNullable().references('id').inTable('evidences')
      table.string('ip_address')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
