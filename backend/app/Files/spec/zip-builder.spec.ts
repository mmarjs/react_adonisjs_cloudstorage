import test from 'japa'
import cuid from 'cuid'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
} from 'Database/factories'
import { BuildZipFileParams, ZipExport } from 'App/types'
import ZipBuild from 'App/Models/ZipBuild'
import ZipBuilder from 'App/Files/ZipBuilder'

test.group('Files', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('building workgroup zip folders returns correct structure', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      name: 'Workgroup',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      name: 'A',
      status: 'active',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: user.id,
      name: 'B',
      status: 'active',
    }).create()

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: user.id,
      name: 'C',
      status: 'active',
    }).create()

    const folderD = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderC.id,
      ownerId: user.id,
      name: 'D',
      status: 'active',
    }).create()

    const topLevelFileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'active',
    }).create()

    const topLevelFileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'trashed',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'trashed',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderC.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderC.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'trashed',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderD.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderD.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 100000,
      status: 'trashed',
    }).create()

    const params: BuildZipFileParams = {
      resource: 'workgroup',
      resourceId: caseInstance.id,
      parentId: root.id,
      files: [topLevelFileA.id, topLevelFileB.id],
      folders: [folderA.id],
    }

    const builder = new ZipBuilder(params, user.id, company.id)
    await builder.build(cuid())

    const build = await ZipBuild.find(builder.zipBuildId)
    const output = build?.output as ZipExport

    assert.equal(output.name, 'Workgroup.zip')
    assert.lengthOf(output.files, 2)
    assert.lengthOf(output.folders, 4)
    assert.equal(output.folders[0].path, 'A/')
    assert.lengthOf(output.folders[0].files, 1)
    assert.equal(output.folders[1].path, 'A/B/')
    assert.lengthOf(output.folders[1].files, 1)
    assert.equal(output.folders[2].path, 'A/B/C/')
    assert.lengthOf(output.folders[2].files, 1)
    assert.equal(output.folders[3].path, 'A/B/C/D/')
    assert.lengthOf(output.folders[3].files, 1)
  })

  test('building personal  zip folders returns correct structure', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
      name: 'Personal',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      name: 'A',
      status: 'active',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderA.id,
      name: 'B',
      status: 'active',
    }).create()

    const folderC = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderB.id,
      name: 'C',
      status: 'active',
    }).create()

    const folderD = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderC.id,
      name: 'D',
      status: 'active',
    }).create()

    const topLevelFileA = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      size: 100000,
      status: 'active',
    }).create()

    const topLevelFileB = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      size: 100000,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      size: 100000,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      size: 100000,
      status: 'trashed',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderB.id,
      fileTypeId: 1,
      size: 100000,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderB.id,
      fileTypeId: 1,
      size: 100000,
      status: 'trashed',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderC.id,
      fileTypeId: 1,
      size: 100000,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderC.id,
      fileTypeId: 1,
      size: 100000,
      status: 'trashed',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderD.id,
      fileTypeId: 1,
      size: 100000,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderD.id,
      fileTypeId: 1,
      size: 100000,
      status: 'trashed',
    }).create()

    const params: BuildZipFileParams = {
      resource: 'personal',
      resourceId: user.id,
      parentId: root.id,
      files: [topLevelFileA.id, topLevelFileB.id],
      folders: [folderA.id],
    }

    const builder = new ZipBuilder(params, user.id, company.id)
    await builder.build(cuid())

    const build = await ZipBuild.find(builder.zipBuildId)
    const output = build?.output as ZipExport

    assert.equal(output.name, 'Personal.zip')
    assert.lengthOf(output.files, 2)
    assert.lengthOf(output.folders, 4)
    assert.equal(output.folders[0].path, 'A/')
    assert.lengthOf(output.folders[0].files, 1)
    assert.equal(output.folders[1].path, 'A/B/')
    assert.lengthOf(output.folders[1].files, 1)
    assert.equal(output.folders[2].path, 'A/B/C/')
    assert.lengthOf(output.folders[2].files, 1)
    assert.equal(output.folders[3].path, 'A/B/C/D/')
    assert.lengthOf(output.folders[3].files, 1)
  })
})
