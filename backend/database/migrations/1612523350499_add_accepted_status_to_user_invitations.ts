import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddAcceptedStatusToUserInvitations extends BaseSchema {
  protected tableName = 'user_invitations'

  public async up() {
    this.schema.raw(`
      ALTER TABLE
        ${this.tableName}
      MODIFY COLUMN
        status enum(
        'sent',
        'opened',
        'accepted')
     AFTER code;`)
  }

  public async down() {
    this.schema.raw(`
      ALTER TABLE
        ${this.tableName}
      MODIFY COLUMN
        status enum(
        'sent',
        'opened',
        'created')
     AFTER code;`)
  }
}
