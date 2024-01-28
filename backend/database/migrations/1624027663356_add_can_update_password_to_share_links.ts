import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCanUpdatePasswordToShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('share_type').after('message')
      table.boolean('can_update_password').defaultTo(false).after('message')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('can_update_password')
      table.dropColumn('share_type')
    })
  }
}
