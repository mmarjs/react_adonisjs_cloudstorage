import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServicesSchema extends BaseSchema {
  protected tableName = 'services'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').unique().notNullable()
      table.boolean('active').notNullable().defaultTo(false)
      table.boolean('filterable').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
