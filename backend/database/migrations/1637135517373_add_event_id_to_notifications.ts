import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddEventIdToNotifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('event_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('events')
        .after('company_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('event_id')
      table.dropColumn('event_id')
    })
  }
}
