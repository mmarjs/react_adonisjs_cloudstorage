import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdatePublicCaseIdIndexInCases extends BaseSchema {
  protected tableName = 'cases'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('public_case_id', 'cases_public_case_id_unique')
      table.unique(['company_id', 'public_case_id'])
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['public_case_id'], 'cases_public_case_id_unique')
    })
  }
}
