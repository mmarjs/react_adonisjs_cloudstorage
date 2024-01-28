import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddTrackingDatesToAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('finished_at')
      table.timestamp('ended_collection_at').nullable().after('updated_at')
      table.timestamp('started_collection_at').nullable().after('updated_at')
      table.timestamp('authorized_by_user_at').nullable().after('updated_at')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('finished_at').nullable().after('updated_at')
      table.dropColumn('ended_collection_at')
      table.dropColumn('started_collection_at')
      table.dropColumn('authorized_by_user_at')
    })
  }
}
