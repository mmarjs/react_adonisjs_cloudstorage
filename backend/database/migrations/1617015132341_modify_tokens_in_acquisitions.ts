import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyTokensInAcquisitions extends BaseSchema {
  protected tableName = 'acquisitions'

  public async up() {
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN access_token TEXT;`)
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN refresh_token TEXT;`)
  }

  public async down() {
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN access_token VARCHAR(255);`)
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN refresh_token VARCHAR(255);`)
  }
}
