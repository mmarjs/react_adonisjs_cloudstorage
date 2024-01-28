import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class NotificationSettingSchema extends BaseSchema {
  protected tableName = 'notification_settings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
