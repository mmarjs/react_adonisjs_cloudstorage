import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDisabledAtToRoles extends BaseSchema {
  protected tableName = 'roles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('disabled_at', { useTz: true }).after('updated_at')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('disabled_at')
    })
  }
}
