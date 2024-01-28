import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Env from '@ioc:Adonis/Core/Env'
import { CompanyFactory, UserFactory, RoleFactory, PersonalFolderFactory } from 'Database/factories'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    if (Env.get('NODE_ENV') !== 'production') {
      // await this.makeAccountOwnerNo2FA()
      // await this.makeAccountOwnerWith2FA()
      // await this.makeAccountOwnerWithTwoRolesNo2FA()
      // await this.makeRoleUserWithOneCompanyNo2FA()
      // await this.makeRoleUserWithOneCompanyWith2FA()
      // await this.makeRoleUserWithThreeCompaniesNo2FA()
      // await this.makeRoleUserWithThreeCompaniesWith2FA()
    }
  }

  public async makeAccountOwnerNo2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.account.owner.no2fa'),
      firstName: 'Account',
      lastName: 'Owner',
      status: 'active',
      verified: true,
      isTwoFactorRequired: false,
    }).create()

    const company = await CompanyFactory.merge({
      userId: user.id,
      name: 'Account Owner No 2FA',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'Personal Folder',
      access: 'private',
    }).create()
  }

  public async makeAccountOwnerWith2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.account.owner.with2fa'),
      firstName: 'Account',
      lastName: 'Owner',
      status: 'active',
      verified: true,
      isTwoFactorRequired: true,
    }).create()

    const company = await CompanyFactory.merge({
      userId: user.id,
      name: 'Account Owner 2FA',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'Personal Folder',
      access: 'private',
    }).create()
  }

  public async makeAccountOwnerWithTwoRolesNo2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.account.owner.two.roles.no2fa'),
      firstName: 'Account',
      lastName: 'Owner',
      status: 'active',
      verified: true,
      isTwoFactorRequired: false,
    }).create()

    const company = await CompanyFactory.merge({
      userId: user.id,
      name: 'Account Owner Two Roles No 2FA',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'Personal Folder',
      access: 'private',
    }).create()

    const companyB = await CompanyFactory.with('user').create()
    const companyC = await CompanyFactory.with('user').create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyB.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyC.id,
      role: 'account-admin',
    }).create()
  }

  public async makeRoleUserWithOneCompanyNo2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.role.user.onecompany.no2fa'),
      firstName: 'Account',
      lastName: 'Admin',
      status: 'active',
      verified: true,
    }).create()

    const company = await CompanyFactory.with('user').create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: company.id,
      role: 'account-admin',
    }).create()

    await PersonalFolderFactory.merge({ userId: user.id, companyId: company.id }).create()
  }

  public async makeRoleUserWithOneCompanyWith2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.role.user.onecompany.with2fa'),
      firstName: 'Account',
      lastName: 'Admin',
      status: 'active',
      verified: true,
    }).create()

    const company = await CompanyFactory.apply('2fa_required').with('user').create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: company.id,
      role: 'account-admin',
    }).create()

    await PersonalFolderFactory.merge({ userId: user.id, companyId: company.id }).create()
  }

  public async makeRoleUserWithThreeCompaniesNo2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.role.user.multicompany.no2fa'),
      firstName: 'Account',
      lastName: 'Admin',
      status: 'active',
      verified: true,
    }).create()

    const companyA = await CompanyFactory.with('user').create()
    const companyB = await CompanyFactory.with('user').create()
    const companyC = await CompanyFactory.with('user').create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyA.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyB.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyC.id,
      role: 'account-admin',
    }).create()

    await PersonalFolderFactory.merge({ userId: user.id, companyId: companyA.id }).create()
  }

  public async makeRoleUserWithThreeCompaniesWith2FA() {
    const user = await UserFactory.merge({
      email: this.makeEmail('test.role.user.multicompany.with2fa'),
      firstName: 'Account',
      lastName: 'Admin',
      status: 'active',
      verified: true,
    }).create()

    const companyA = await CompanyFactory.apply('2fa_required').with('user').create()
    const companyB = await CompanyFactory.apply('2fa_required').with('user').create()
    const companyC = await CompanyFactory.apply('2fa_required').with('user').create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyA.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyB.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: companyC.id,
      role: 'account-admin',
    }).create()

    await PersonalFolderFactory.merge({ userId: user.id, companyId: companyA.id }).create()
  }

  private makeEmail(val: string): string {
    const prefix = Env.get('TEST_EMAIL_PREFIX')
    const domain = Env.get('TEST_EMAIL_DOMAIN')

    return `${prefix}+${val}@${domain}`
  }
}
