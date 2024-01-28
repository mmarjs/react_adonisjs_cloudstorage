import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class EnterpriseSubscribers extends BaseSchema {
  protected tableName = 'enterprise_subscribers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table
        .integer('enterprise_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('enterprises')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
