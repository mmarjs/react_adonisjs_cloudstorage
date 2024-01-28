import AWS from 'aws-sdk'
import Log from 'App/Lib/Log'
import * as fsAsync from 'fs/promises'
import fs from 'fs'
import Axios from 'axios'
import xml2js from 'xml2js'
import S3, {
  CopyObjectRequest,
  DeleteObjectRequest,
  GetObjectAclRequest,
  Types,
} from 'aws-sdk/clients/s3'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { wasabiConfig } from 'App/Wasabi/WasabiConfig'
import {
  DownloadedFileData,
  WasabiConfig,
  WasabiTemporaryCredentials,
  WasabiLocation,
  FileAccessCategory,
  FileInfo,
} from 'App/types'

/**
 * This method is only for a file no larger than 5MB
 */
export async function smallUpload(
  config: WasabiConfig,
  fileData: DownloadedFileData,
  wasabiPath: string
): Promise<boolean> {
  try {
    const s3 = new AWS.S3(config)
    const body = await fsAsync.readFile(`${Env.get('TMP_DIR')}/${fileData.tmpFileName}`)

    const params: Types.PutObjectRequest = {
      Body: body,
      Bucket: config.bucket,
      ContentMD5: fileData.md5,
      ContentType: fileData.contentType,
      Key: wasabiPath,
    }

    await s3.putObject(params).promise()
    Logger.info(`File uploaded to Wasabi: ${wasabiPath}`)

    return true
  } catch (err) {
    Log(err)
    return false
  }
}

/**
 * This method is for files larger than 5MB
 */
export async function managedUpload(
  config: WasabiConfig,
  fileData: DownloadedFileData,
  wasabiPath: string
): Promise<boolean> {
  try {
    const path = `${Env.get('TMP_DIR')}/${fileData.tmpFileName}`

    try {
      await fsAsync.access(path)
    } catch {
      return false
    }

    const stream = fs.createReadStream(path)

    const uploader = new AWS.S3.ManagedUpload({
      params: {
        Bucket: config.bucket,
        Key: wasabiPath,
        ContentType: fileData.contentType,
        Body: stream,
      },
    })

    uploader.send((err, data) => {
      if (err) {
        throw new Error(err.message)
      }

      Logger.info(data.Location)
    })

    uploader.on('httpUploadProgress', (progress) => {
      Logger.debug(`${progress.loaded} of ${progress.total}`)
    })

    return true
  } catch (err) {
    Log(err)
    return false
  }
}

export async function generatePresignedPostUrl(
  config: WasabiConfig,
  key: string,
  expires = 3600
): Promise<string> {
  const s3 = new AWS.S3(config)

  const params = { Bucket: config.bucket, Key: key, Expires: expires }

  const result = await s3.getSignedUrlPromise('putObject', params)

  return result
}

export async function generatePresignedGetUrl(
  config: WasabiConfig,
  key: string,
  expires = 60
): Promise<string> {
  const s3 = new AWS.S3(config)

  const params = { Bucket: config.bucket, Key: key, Expires: expires }

  const result = await s3.getSignedUrlPromise('getObject', params)

  return result
}

export async function generateTempCredentials(
  config: WasabiConfig
): Promise<WasabiTemporaryCredentials | false> {
  const accountId = Env.get('WASABI_ACCOUNT_NO')
  const user = Env.get('WASABI_USER')
  const password = Env.get('WASABI_PASSWORD')

  const url = new URL('https://iam.wasabisys.com/')
  url.searchParams.append('Action', 'CreateTemporaryAccessCredentials')
  url.searchParams.append('AccountId', String(accountId))
  url.searchParams.append('UserName', user)
  url.searchParams.append('Password', password)

  const axios = Axios.create()

  try {
    const res = await axios.get(url.href)

    var parser = new xml2js.Parser()
    const parsed: any = await parser.parseStringPromise(res.data)
    const data =
      parsed?.CreateTemporaryAccessCredentialsResponse?.CreateTemporaryAccessCredentialsResult[0]
        ?.AccessKey[0]

    if (!data) {
      return false
    }

    const credentials: WasabiTemporaryCredentials = {
      AccessKeyId: data.AccessKeyId[0],
      SecretAccessKey: data.SecretAccessKey[0],
      Expires: data.Expires[0],
      Bucket: config.bucket,
    }

    return credentials
  } catch (err) {
    return false
  }
}

export async function objectExists(config: WasabiConfig, path: string) {
  const s3 = new AWS.S3(config)

  const params: GetObjectAclRequest = {
    Bucket: config.bucket,
    Key: path,
  }

  try {
    await s3.getObjectAcl(params).promise()
    return true
  } catch (_) {
    return false
  }
}

export async function copyObject(
  config: WasabiConfig,
  source: WasabiLocation,
  dest: WasabiLocation
) {
  const s3 = new AWS.S3(config)
  const params: CopyObjectRequest = {
    Bucket: dest.bucket,
    CopySource: `/${source.bucket}/${source.path}`,
    Key: dest.path,
    ACL: 'private',
  }

  try {
    await s3.copyObject(params).promise()
  } catch (_) {
    return false
  }

  return true
}

export async function deleteObject(config: WasabiConfig, path: string) {
  const s3 = new AWS.S3(config)

  const params: DeleteObjectRequest = {
    Bucket: config.bucket,
    Key: path,
  }

  try {
    await s3.deleteObject(params).promise()
  } catch (_) {
    return false
  }

  return true
}

export async function moveObject(
  config: WasabiConfig,
  source: WasabiLocation,
  dest: WasabiLocation,
  copyFile: (
    config: WasabiConfig,
    source: WasabiLocation,
    dest: WasabiLocation
  ) => Promise<boolean>,
  deleteFile: (config: WasabiConfig, source: WasabiLocation) => Promise<boolean>
) {
  const result = await copyFile(config, source, dest)

  if (!result) {
    return false
  }

  return await deleteFile(config, source)
}

export async function getSignedDownloadUrl(
  category: FileAccessCategory,
  info: FileInfo,
  expires = 60
): Promise<string> {
  const bucket =
    category === 'evidence' ? Env.get('WASABI_EVIDENCE_BUCKET') : Env.get('WASABI_WORKSPACE_BUCKET')
  const config = wasabiConfig(bucket)

  const s3 = new AWS.S3(config)

  const params = {
    Bucket: config.bucket,
    Key: info.path,
    Expires: expires,
    ResponseContentDisposition: `attachment; filename="${info.filename}"`,
  }

  const result = await s3.getSignedUrlPromise('getObject', params)

  return result
}

export async function getSignedUrlForZip(
  category: Partial<FileAccessCategory>,
  filename: string,
  wasabiPath: string,
  expires = 3600
): Promise<string> {
  const bucket =
    category === 'evidence' ? Env.get('WASABI_EVIDENCE_BUCKET') : Env.get('WASABI_WORKSPACE_BUCKET')
  const config = wasabiConfig(bucket)

  const s3 = new AWS.S3(config)

  const params = {
    Bucket: config.bucket,
    Key: wasabiPath,
    Expires: expires,
    ResponseContentDisposition: `inline; filename="${filename}"`,
  }

  const result = await s3.getSignedUrlPromise('getObject', params)

  return result
}

export function makeUploadClient(category: FileAccessCategory) {
  const bucket =
    category === 'evidence' ? Env.get('WASABI_EVIDENCE_BUCKET') : Env.get('WASABI_WORKSPACE_BUCKET')
  const config = wasabiConfig(bucket)

  const opts = {
    signatureVersion: 'v4',
    endpoint: config.endpoint,
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    bucket: config.bucket,
  }

  const s3 = new S3(opts)

  return s3
}
