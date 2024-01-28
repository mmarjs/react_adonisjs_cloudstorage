import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterStatusToStringInUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN
    status VARCHAR(40) AFTER last_name;`)
  }

  public async down() {
    this.schema.raw(`
    ALTER TABLE
      ${this.tableName}
    MODIFY COLUMN
      status enum(
      'invited',
      'active',
      'suspended',
      'deleted')
   AFTER last_name;`)
  }
}
