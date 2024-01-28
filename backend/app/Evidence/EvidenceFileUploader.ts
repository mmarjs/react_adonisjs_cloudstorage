import cuid from 'cuid'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'
import Service from 'App/Models/Service'
import { DownloadedFileData } from 'App/types'
import Acquisition from 'App/Models/Acquisition'
import ServiceItem from 'App/Models/ServiceItem'
import EvidenceItem from 'App/Models/EvidenceItem'
import { wasabiConfig } from 'App/Wasabi/WasabiConfig'
import { managedUpload, smallUpload } from 'App/Wasabi/Wasabi'
import EvidenceFileName from 'App/Evidence/EvidenceFileNamer'

export default class EvidenceFileUploader {
  private fileData: DownloadedFileData
  private acquisition: Acquisition
  private service: Service
  private serviceItem: ServiceItem
  private evdienceItem: EvidenceItem
  private nonce: string
  private wasabiPath: string

  constructor(
    fileData: DownloadedFileData,
    acquistion: Acquisition,
    service: Service,
    serviceItem: ServiceItem
  ) {
    this.fileData = fileData
    this.acquisition = acquistion
    this.service = service
    this.serviceItem = serviceItem
    this.nonce = cuid()
  }

  public async upload(): Promise<boolean> {
    try {
      await this.storePendingEvidenceItem()

      let result: boolean
      const config = wasabiConfig(Env.get('WASABI_EVIDENCE_BUCKET'))

      if (this.fileData.fileSize > 5e6) {
        result = await managedUpload(config, this.fileData, this.wasabiPath)
      } else {
        result = await smallUpload(config, this.fileData, this.wasabiPath)
      }

      if (!result) {
        return false
      }

      await this.updateEvidenceItem('stored')

      return true
    } catch {
      return false
    }
  }

  public getEvidenceItem(): EvidenceItem {
    return this.evdienceItem
  }

  private async getWasabiFilePath(): Promise<string> {
    const namer = new EvidenceFileName(
      this.acquisition,
      this.service.name,
      this.serviceItem.name,
      this.nonce,
      this.fileData.originalFileName
    )

    return await namer.getPath()
  }

  private async storePendingEvidenceItem(): Promise<void> {
    const path = await this.getWasabiFilePath()
    this.wasabiPath = path

    await this.acquisition.load('evidence')
    const evidenceItem = await EvidenceItem.create({
      evidenceId: this.acquisition.evidence.id,
      serviceItemId: this.serviceItem.id,
      status: 'pending',
      nonce: this.nonce,
      fileEnding: this.fileData.originalFileName,
      path: path,
      size: this.fileData.fileSize,
      md5: this.fileData.md5,
      sha1: this.fileData.sha1,
      dateCollected: DateTime.local(),
    })

    this.evdienceItem = evidenceItem
  }

  private async updateEvidenceItem(status: 'pending' | 'stored'): Promise<void> {
    this.evdienceItem.status = status
    await this.evdienceItem.save()
  }
}
