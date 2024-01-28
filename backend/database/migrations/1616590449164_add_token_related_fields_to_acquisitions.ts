import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddTokenRelatedFieldsToAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('scopes').after('status')
      table.timestamp('access_token_expires_at').after('access_token')
      table.timestamp('refresh_token_expires_at').after('refresh_token')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('scopes')
      table.dropColumn('access_token_expires_at')
      table.dropColumn('refresh_token_expires_at')
    })
  }
}
