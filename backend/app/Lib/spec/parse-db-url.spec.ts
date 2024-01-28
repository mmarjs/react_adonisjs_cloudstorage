import test from 'japa'
import cuid from 'cuid'
import ParseDbUrl from 'App/Lib/ParseDbUrl'

test.group('Parse DB URL', () => {
  test('parse handles mysql url', async (assert) => {
    const protocol = 'mysql'
    const username = cuid()
    const password = cuid()
    const host = `${cuid()}.evidencelocker.com`
    const port = 3306
    const dbname = cuid()

    const url = `${protocol}://${username}:${password}@${host}:${port}/${dbname}`

    const res = ParseDbUrl.parse(url)

    assert.equal(res.username, username)
    assert.equal(res.password, password)
    assert.equal(res.host, host)
    assert.equal(res.port, port)
    assert.equal(res.database, dbname)
  })

  test('parse handles redis url', async (assert) => {
    const protocol = 'redis'
    const username = 'default'
    const password = cuid()
    const host = `${cuid()}.evidencelocker.com`
    const port = 3306

    const url = `${protocol}://${username}:${password}@${host}:${port}`

    const res = ParseDbUrl.parse(url)

    assert.equal(res.username, username)
    assert.equal(res.password, password)
    assert.equal(res.host, host)
    assert.equal(res.port, port)
    assert.equal(res.database, '')
  })
})
