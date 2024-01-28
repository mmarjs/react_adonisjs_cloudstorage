import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropTasksFromAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tasks_total')
      table.dropColumn('tasks_done')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tasks_total').nullable().after('requested_by_id')
      table.integer('tasks_done').nullable().after('requested_by_id')
    })
  }
}
