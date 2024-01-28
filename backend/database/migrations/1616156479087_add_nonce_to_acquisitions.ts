import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddNonceToAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nonce').nullable().after('refresh_token')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nonce')
    })
  }
}
