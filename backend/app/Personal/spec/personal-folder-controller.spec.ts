import test from 'japa'
import cuid from 'cuid'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, PersonalFolderFactory } from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Personal Folder Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('/create returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: 'foo',
    }).create()

    const folderName = cuid()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post('/personal/folder/create')
      .set('token', token)
      .send({
        userId: user.id,
        parentId: root.id,
        name: folderName,
      })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.parent_id, root.id)
        assert.equal(res.body.status, 'active')
      })

    await deleteAuth(token)
  })
})
