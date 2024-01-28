import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropUserNotificationSettings extends BaseSchema {
  protected tableName = 'user_notification_settings'

  public async up() {
    this.schema.dropTable(this.tableName)
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table
        .integer('notification_setting_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('notification_settings')
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamps(true)
    })
  }
}
