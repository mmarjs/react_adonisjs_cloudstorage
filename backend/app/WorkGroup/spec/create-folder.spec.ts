import test from 'japa'
import cuid from 'cuid'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import { CreateWorkGroupFolderPipelineParams } from 'App/types'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  UserFactory,
} from 'Database/factories'

import createFolderPipeline from 'App/WorkGroup/CreateFolder'

test.group('Create Folder Pipeline', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('createFolderPipeline rejects user without access', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
    }).create()

    const fileName = cuid()

    const params: CreateWorkGroupFolderPipelineParams = {
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      companyId: company.id,
      name: fileName,
    }

    const result = await createFolderPipeline(params)

    assert.equal(result.error, 'user-has-no-write-permission')
  })

  test('createFolderPipeline with conflicting folder name appends suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const params: CreateWorkGroupFolderPipelineParams = {
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      companyId: company.id,
      name: 'AlPha',
    }

    const { error, success } = await createFolderPipeline(params)

    assert.isNull(error)
    assert.equal(success?.name, 'AlPha (1)')
  })

  test('createFolderPipeline returns new folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const params: CreateWorkGroupFolderPipelineParams = {
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      companyId: company.id,
      name: 'Foo',
    }

    const result = await createFolderPipeline(params)

    assert.equal(result.success?.name, 'Foo')
  })
})
