import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropEvidencePermissions extends BaseSchema {
  protected tableName = 'evidence_permissions'

  public async up() {
    this.schema.dropTable(this.tableName)
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('evidence_id').unsigned().notNullable().references('id').inTable('evidences')
      table.timestamps(true)
    })
  }
}
