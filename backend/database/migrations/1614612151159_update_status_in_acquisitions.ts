import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateStatusInAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
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

  public async down() {
    this.schema.raw(`
    ALTER TABLE
      ${this.tableName}
    MODIFY COLUMN
      status enum(
      'in_progress',
      'finished',
      'archived')
   AFTER after;`)
  }
}
