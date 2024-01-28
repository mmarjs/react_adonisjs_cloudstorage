import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterStatusEnumInCases extends BaseSchema {
  protected tableName = 'cases'

  public async up() {
    this.schema.raw(`
      ALTER TABLE
        ${this.tableName}
      MODIFY COLUMN
        status enum(
        'active',
        'archived',
        'deleted')
     AFTER notes;`)
  }

  public async down() {
    this.schema.raw(`
      ALTER TABLE
        ${this.tableName}
      MODIFY COLUMN
        status enum(
        'active',
        'archived')
     AFTER notes;`)
  }
}
