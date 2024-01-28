import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropNameFromNotificationSettings extends BaseSchema {
  protected tableName = 'notification_settings'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name')
    })
  }
}
