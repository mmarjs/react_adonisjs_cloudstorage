import test from 'japa'
import AWS from 'aws-sdk-mock'
import Env from '@ioc:Adonis/Core/Env'
import { DownloadedFileData } from 'App/types'
import { DateTime } from 'luxon'
import {
  smallUpload,
  managedUpload,
  generatePresignedGetUrl,
  generatePresignedPostUrl,
} from 'App/Wasabi/Wasabi'

import { wasabiConfig } from 'App/Wasabi/WasabiConfig'

test.group('Wasabi', () => {
  test.skip('smallUpload returns true', async (assert) => {
    AWS.mock('S3', 'putObject', { message: 'foo' })

    const fileData: DownloadedFileData = {
      tmpFileName: 'small.bin',
      originalFileName: 'small.bin',
      fileSize: 40960,
      md5: 'a0d49cc7dc5d9275a384019ece6123e1',
      sha1: '361cb46c43fcdeca323d804c55d69ea7bfd79133',
      lastModified: 'Mon, 12 Apr 2021 12:40:37 GMT',
      contentType: 'application/octet-stream',
    }

    const wasabiPath = 'test/small.bin'

    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))

    const result = await smallUpload(config, fileData, wasabiPath)

    assert.isTrue(result)

    AWS.restore('S3', 'putObject')
  })

  test.skip('smallUpload returns false if tmp file does not exist', async (assert) => {
    AWS.mock('S3', 'putObject', { message: 'foo' })

    const fileData: DownloadedFileData = {
      tmpFileName: 'small.false',
      originalFileName: 'small.false',
      fileSize: 40960,
      md5: 'a0d49cc7dc5d9275a384019ece6123e1',
      sha1: '361cb46c43fcdeca323d804c55d69ea7bfd79133',
      lastModified: 'Mon, 12 Apr 2021 12:40:37 GMT',
      contentType: 'application/octet-stream',
    }

    const wasabiPath = 'test/small.bin'

    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))

    const result = await smallUpload(config, fileData, wasabiPath)

    assert.isFalse(result)

    AWS.restore('S3', 'putObject')
  })

  test.skip('managedUpload returns true', async (assert) => {
    AWS.mock('S3', 'ManagedUpload', { message: 'foo' })

    const fileData: DownloadedFileData = {
      tmpFileName: 'big.bin',
      originalFileName: 'big.bin',
      fileSize: 15000000,
      md5: 'bb479e75677dc553c3ef6dd77127f199',
      sha1: '6beaa3c466e1c426ce5a0914de5bf67ae3d2a08e',
      lastModified: 'Mon, 12 Apr 2021 12:40:37 GMT',
      contentType: 'application/octet-stream',
    }

    const wasabiPath = 'test/big.bin'

    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))

    const result = await managedUpload(config, fileData, wasabiPath)
    assert.isTrue(result)

    AWS.restore('S3')
  })

  test.skip('managedUpload returns false if tmp file does not exist', async (assert) => {
    AWS.mock('S3', 'ManagedUpload', { message: 'foo' })

    const fileData: DownloadedFileData = {
      tmpFileName: 'big.false',
      originalFileName: 'big.false',
      fileSize: 15000000,
      md5: 'bb479e75677dc553c3ef6dd77127f199',
      sha1: '6beaa3c466e1c426ce5a0914de5bf67ae3d2a08e',
      lastModified: 'Mon, 12 Apr 2021 12:40:37 GMT',
      contentType: 'application/octet-stream',
    }

    const wasabiPath = 'test/big.false'

    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))

    const result = await managedUpload(config, fileData, wasabiPath)

    assert.isFalse(result)

    AWS.restore('S3')
  })

  test('generatePresignedPostUrl returns signed url', async (assert) => {
    const key = 'foo.png'
    const now = DateTime.local().toSeconds()

    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))
    const url = await generatePresignedPostUrl(config, key)

    assert.isString(url)
    assert.isAtLeast(url.length, 30)

    const parsed = new URL(url)

    assert.isTrue(parsed.hostname.includes('wasabisys'))

    parsed.searchParams.forEach((value, key) => {
      assert.isNotEmpty(value)

      if (key === 'Expires') {
        const expiry = Number(value)
        const diff = expiry - now
        assert.approximately(diff, 3600, 2)
      }
    })
  })

  test('generatePresignedGetUrl returns signed url', async (assert) => {
    const key = 'foo.png'
    const expires = 120
    const now = DateTime.local().toSeconds()

    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))
    const url = await generatePresignedGetUrl(config, key, expires)

    assert.isString(url)
    assert.isAtLeast(url.length, 30)

    const parsed = new URL(url)

    assert.isTrue(parsed.hostname.includes('wasabisys'))

    parsed.searchParams.forEach((value, key) => {
      assert.isNotEmpty(value)

      if (key === 'Expires') {
        const expiry = Number(value)
        const diff = expiry - now
        assert.approximately(diff, 120, 2)
      }
    })
  })
})
