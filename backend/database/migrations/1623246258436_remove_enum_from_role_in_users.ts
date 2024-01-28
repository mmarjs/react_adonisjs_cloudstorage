import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RemoveEnumFromRoleInUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} MODIFY COLUMN role VARCHAR(255) AFTER last_name;`
    )
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enu('role', [
        'super-admin',
        'account-owner',
        'account-admin',
        'case-manager',
        'evidence-user',
      ])
    })
  }
}
