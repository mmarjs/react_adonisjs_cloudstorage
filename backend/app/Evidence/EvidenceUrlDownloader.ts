import fs from 'fs'
import crypto from 'crypto'
import axios from 'axios'
import cuid from 'cuid'
import * as luxon from 'luxon'
import * as stream from 'stream'
import { promisify } from 'util'
import Env from '@ioc:Adonis/Core/Env'
import { HttpFileMetadata, DownloadedFileData } from 'App/types'

export default class EvidenceUrlDownloader {
  private tmpDir = Env.get('TMP_DIR')
  private url: string
  private originalFilename: string
  private tmpFileName: string
  private localPath: string

  constructor(url: string) {
    this.url = url
    this.originalFilename = this.getOriginalFilename()
    this.tmpFileName = cuid()
    this.localPath = `${this.tmpDir}/${this.tmpFileName}`
  }

  public async download(): Promise<DownloadedFileData> {
    const metadata = await this.getFileMetadata()

    const writer = fs.createWriteStream(this.localPath)
    const finished = promisify(stream.finished)

    await axios({
      url: this.url,
      method: 'GET',
      responseType: 'stream',
    }).then(async (res) => {
      res.data.pipe(writer)
      return finished(writer)
    })

    const fileSize = await this.getFileSize()
    const md5 = await this.getMd5()
    const sha1 = await this.getSha1()
    this.touchFile(metadata)

    return {
      contentType: metadata.contentType,
      lastModified: metadata.lastModified,
      fileSize,
      md5,
      sha1,
      tmpFileName: this.tmpFileName,
      originalFileName: this.originalFilename,
    }
  }

  private async getFileMetadata(): Promise<HttpFileMetadata> {
    const response = await axios({ url: this.url, method: 'HEAD' })

    if (response.status !== 200) {
      throw new Error(response.statusText)
    }
    const contentType = response.headers['content-type']
    const lastModified: string | null = response.headers['last-modified'] ?? null

    return { contentType, lastModified }
  }

  private getOriginalFilename(): string {
    const parts = this.url.split('/')
    const index = parts.length - 1
    return parts[index]
  }

  private async getFileSize(): Promise<number> {
    const stat = promisify(fs.stat)
    const res = await stat(this.localPath)

    return res.size
  }

  private async getMd5(): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5')
      const stream = fs.createReadStream(this.localPath)
      stream.on('error', (err) => reject(err))
      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('hex')))
    })
  }

  private async getSha1(): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1')
      const stream = fs.createReadStream(this.localPath)
      stream.on('error', (err) => reject(err))
      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('hex')))
    })
  }

  private touchFile(metadata: HttpFileMetadata) {
    try {
      const time = this.getLasModifiedMillis(metadata.lastModified)
      fs.utimesSync(this.localPath, time, time)
    } catch (err) {
      fs.closeSync(fs.openSync(this.localPath, 'w'))
    }
  }

  private getLasModifiedMillis(lastModified: string | null): number {
    if (lastModified === null) {
      return luxon.DateTime.local().toMillis()
    }

    return luxon.DateTime.fromHTTP(lastModified).toMillis()
  }
}
