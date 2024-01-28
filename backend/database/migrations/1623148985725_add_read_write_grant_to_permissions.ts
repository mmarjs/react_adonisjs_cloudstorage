import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddReadWriteGrantToPermissions extends BaseSchema {
  protected tableName = 'permissions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('grant').defaultTo(false).after('resource')
      table.boolean('trash').defaultTo(false).after('resource')
      table.boolean('write').defaultTo(false).after('resource')
      table.boolean('read').defaultTo(false).after('resource')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('grant')
      table.dropColumn('trash')
      table.dropColumn('write')
      table.dropColumn('read')
      table.enu('resource', ['case', 'evidence', 'custodian']).alter()
    })
  }
}
