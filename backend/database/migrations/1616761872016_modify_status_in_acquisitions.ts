import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyStatusInAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.raw(`
    ALTER TABLE
      ${this.tableName}
    MODIFY COLUMN
    status VARCHAR(255) DEFAULT 'auth_pending' NOT NULL;
    `)
  }

  public async down() {
    this.schema.raw(`
    ALTER TABLE
      ${this.tableName}
    MODIFY COLUMN
      status enum(
      'auth_pending',
      'in_progress',
      'collected',
      'archived')
   AFTER after;`)
  }
}
