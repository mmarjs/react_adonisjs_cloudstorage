import fs from 'fs'
import test from 'japa'
import crypto from 'crypto'
import { promisify } from 'util'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import EvidenceUrlDownloader from 'App/Evidence/EvidenceUrlDownloader'

test.group('Evidence Url Downloader', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test.skip('downloads splash.png', async (assert) => {
    const tmpDir = Env.get('TMP_DIR')
    const url = `${Env.get('APP_URL')}/splash.png`

    const downloader = new EvidenceUrlDownloader(url)
    const fileData = await downloader.download()

    const path = `${tmpDir}/${fileData.tmpFileName}`

    const stat = promisify(fs.stat)
    const unlink = promisify(fs.unlink)

    let fileExists: boolean = false

    try {
      await stat(path)
      fileExists = true
    } catch {
      fileExists = false
    }

    assert.isTrue(fileExists)

    await unlink(path)
  })

  test.skip('returned file size is correct', async (assert) => {
    const tmpDir = Env.get('TMP_DIR')
    const url = `${Env.get('APP_URL')}/splash.png`

    const downloader = new EvidenceUrlDownloader(url)
    const fileData = await downloader.download()

    const path = `${tmpDir}/${fileData.tmpFileName}`
    const stat = promisify(fs.stat)
    const unlink = promisify(fs.unlink)

    const stats = await stat(path)

    assert.equal(fileData.fileSize, stats.size)

    await unlink(path)
  })

  test.skip('returned file hash is correct', async (assert) => {
    const tmpDir = Env.get('TMP_DIR')
    const url = `${Env.get('APP_URL')}/splash.png`

    const downloader = new EvidenceUrlDownloader(url)
    const fileData = await downloader.download()

    const path = `${tmpDir}/${fileData.tmpFileName}`
    const unlink = promisify(fs.unlink)

    const getHash = (path) =>
      new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha1')
        const stream = fs.createReadStream(path)
        stream.on('error', (err) => reject(err))
        stream.on('data', (chunk) => hash.update(chunk))
        stream.on('end', () => resolve(hash.digest('hex')))
      })

    const testHash = await getHash(path)
    assert.equal(fileData.sha1, testHash)
    await unlink(path)
  })
})
