import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Acquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('token')
      table.string('access_token').nullable().after('status')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('access_token')
      table.string('token').notNullable()
    })
  }
}
