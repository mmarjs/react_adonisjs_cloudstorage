import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Cases extends BaseSchema {
  protected tableName = 'cases'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.integer('case_type_id').unsigned().notNullable().references('id').inTable('case_types')
      table.integer('time_zone_id').unsigned().notNullable().references('id').inTable('time_zones')
      table.integer('created_by_id').unsigned().notNullable()
      table.string('public_case_id').notNullable().unique()
      table.string('case_number').unique()
      table.string('case_name')
      table.string('client_name')
      table.string('client_reference').nullable()
      table.string('client_phone').nullable()
      table.string('client_email').nullable()
      table.text('notes').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
