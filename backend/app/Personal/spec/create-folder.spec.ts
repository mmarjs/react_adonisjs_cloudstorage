import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import { CreatePersonalFolderPipelineParams } from 'App/types'
import { CompanyFactory, RoleFactory, PersonalFolderFactory } from 'Database/factories'
import createFolder from 'App/Personal/CreateFolder'

test.group('Create Personal Folder', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('createFolder with conflicting folder name appends suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()

    const user = role.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: 'Personal',
      status: 'active',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: 'alpha',
      status: 'active',
    }).create()

    const params: CreatePersonalFolderPipelineParams = {
      userId: user.id,
      parentId: root.id,
      name: 'AlPha',
    }

    const { error, success } = await createFolder(params, company.id)

    assert.isNull(error)
    assert.equal(success?.name, 'AlPha (1)')
  })

  test('createFolder returns new folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()

    const user = role.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: 'Personal',
      status: 'active',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: 'alpha',
      status: 'active',
    }).create()

    const params: CreatePersonalFolderPipelineParams = {
      userId: user.id,
      parentId: root.id,
      name: 'Foo',
    }

    const result = await createFolder(params, company.id)

    assert.equal(result.success?.name, 'Foo')
  })
})
