import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddArchivedStatusCustodianRequests extends BaseSchema {
  protected tableName = 'custodian_requests'

  public async up() {
    this.schema.raw(`
      ALTER TABLE
        ${this.tableName}
      MODIFY COLUMN
        status enum(
        'sent',
        'in_progress',
        'finished',
        'archived')
     NOT NULL
     AFTER after;`)
  }

  public async down() {
    this.schema.raw(`
      ALTER TABLE
        ${this.tableName}
      MODIFY COLUMN
        status enum(
        'sent',
        'in_progress',
        'finished')
     AFTER after;`)
  }
}
