import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RefactorNotificationSettings extends BaseSchema {
  protected tableName = 'notification_settings'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('acquisition_completed')
      table.dropColumn('acquisition_authenticated')
      table.dropColumn('acquisition_requested')
      table.dropColumn('account_deleted')
      table.dropColumn('user_added')
      table.dropColumn('case_created')
      table.boolean('send_email').after('user_id').defaultTo(false)
      table.boolean('send_app').after('user_id').defaultTo(true)
      table.string('event').notNullable().after('user_id').defaultTo('general')
      table
        .integer('company_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('companies')
        .after('user_id')
        .defaultTo(1)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('company_id')
      table.dropColumn('company_id')
      table.dropColumn('event')
      table.dropColumn('send_email')
      table.dropColumn('send_app')
      table.boolean('acquisition_completed').after('user_id')
      table.boolean('acquisition_authenticated').after('user_id')
      table.boolean('acquisition_requested').after('user_id')
      table.boolean('account_deleted').after('user_id')
      table.boolean('user_added').after('user_id')
      table.boolean('case_created').after('user_id')
    })
  }
}
