import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, PersonalFileFactory } from 'Database/factories'
import FileInfo from 'App/Files/FileInfo'

test.group('File Info', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('FileInfo returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const file = await PersonalFileFactory.merge({ fileTypeId: 1 })
      .with('folder', 1, (q) => q.merge({ userId: user.id, companyId: company.id }))
      .create()

    const fileInfo = new FileInfo('personal', file.id)
    const info = await fileInfo.info()

    assert.equal(info.filename, file.name)
    assert.equal(info.path, file.path)
    assert.equal(info.folderName, file.folder.name)
  })
})
