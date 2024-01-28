import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RemoveEnumFromPermissions extends BaseSchema {
  protected tableName = 'permissions'

  public async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} MODIFY COLUMN resource VARCHAR(255) AFTER user_id;`
    )
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enu('resource', ['case', 'evidence', 'custodian'])
    })
  }
}
