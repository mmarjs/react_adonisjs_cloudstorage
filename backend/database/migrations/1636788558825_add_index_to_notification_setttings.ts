import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddIndexToNotificationSetttings extends BaseSchema {
  protected tableName = 'notification_settings'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['event'])
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['event'])
    })
  }
}
