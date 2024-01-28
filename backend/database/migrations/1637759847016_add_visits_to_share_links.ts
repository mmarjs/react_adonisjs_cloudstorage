import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddVisitsToShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('visits').unsigned().notNullable().defaultTo(0).after('last_login')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('visits')
    })
  }
}
