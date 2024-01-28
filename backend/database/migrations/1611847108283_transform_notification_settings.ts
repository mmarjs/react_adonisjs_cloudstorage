import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TransformNotificationSettings extends BaseSchema {
  protected tableName = 'notification_settings'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .after('id')
      table.boolean('acquisition_completed').after('user_id')
      table.boolean('acquisition_authenticated').after('user_id')
      table.boolean('acquisition_requested').after('user_id')
      table.boolean('account_deleted').after('user_id')
      table.boolean('user_added').after('user_id')
      table.boolean('case_created').after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'], 'notification_settings_user_id_foreign')
      table.dropColumn('acquisition_completed')
      table.dropColumn('acquisition_authenticated')
      table.dropColumn('acquisition_requested')
      table.dropColumn('account_deleted')
      table.dropColumn('user_added')
      table.dropColumn('case_created')
    })
  }
}
