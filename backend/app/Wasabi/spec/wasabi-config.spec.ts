import test from 'japa'
import Env from '@ioc:Adonis/Core/Env'
import { wasabiConfig } from 'App/Wasabi/WasabiConfig'

test.group('Wasabi Config', () => {
  test('wasasbi config bucket return bucket', async (assert) => {
    const config = wasabiConfig('foo')
    assert.equal(config.bucket, 'foo')
    assert.notEqual(config.bucket, Env.get('WASABI_WORKSPACE_BUCKET'))
    assert.equal(config.accessKeyId, Env.get('WASABI_ACCESS_KEY_ID'))
    assert.equal(config.secretAccessKey, Env.get('WASABI_SECRET_ACCESS_KEY'))
  })
})
