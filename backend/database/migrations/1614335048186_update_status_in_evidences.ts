import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateStatusInEvidences extends BaseSchema {
  protected tableName = 'evidences'

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
     AFTER public_evidence_id;`)
  }

  public async down() {
    this.schema.raw(`
    ALTER TABLE
      ${this.tableName}
    MODIFY COLUMN
      status enum(
      'in_progress',
      'collected',
      'archived')
   AFTER public_evidence_id;`)
  }
}
