import test from 'japa'
import cuid from 'cuid'
import { randomBytes } from 'crypto'
import PasswordHasher from 'App/Auth/PasswordHasher'

test.group('PasswordHasher', () => {
  test('hash method returns hash', async (assert) => {
    const password = cuid()
    const salt = randomBytes(32).toString('hex')

    const hasher = new PasswordHasher(password, salt)
    const hashedValue = await hasher.hash()

    assert.isNotEmpty(hashedValue)
  })
})
