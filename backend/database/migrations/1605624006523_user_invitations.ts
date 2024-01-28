import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserInvitationSchema extends BaseSchema {
  protected tableName = 'user_invitations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email').notNullable()
      table.string('code').notNullable()
      table.enu('status', ['sent', 'opened', 'created'])
      table.timestamp('expires_at').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
