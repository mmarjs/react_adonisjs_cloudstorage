import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RefactorAccessLogs extends BaseSchema {
  protected tableName = 'access_logs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('case_id')
      table.dropColumn('case_id')
      table.dropForeign('evidence_id')
      table.dropColumn('evidence_id')
      table.dropColumn('ip_address')
      table.dropColumn('updated_at')
      table.string('action').notNullable().defaultTo('read').after('user_id')
      table.string('resource').index().after('user_id')
      table.integer('resource_id').unsigned().notNullable().index().after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.integer('evidence_id').unsigned().notNullable().references('id').inTable('evidences')
      table.string('ip_address')
      table.timestamp('updated_at', { useTz: true })
    })
  }
}
