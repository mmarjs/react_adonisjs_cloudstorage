import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddRequestedByIdToAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('requested_by_id').unsigned().notNullable().after('access_token')
      table.string('refresh_token').nullable().after('access_token')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('requested_by_id')
      table.dropColumn('refresh_token')
    })
  }
}
