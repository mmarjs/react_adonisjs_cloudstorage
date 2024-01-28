import { Plugin, Uppy, Locale } from '@uppy/core'
import { RecordFileOptions } from 'types'

export default class RecordFilePlugin extends Plugin {
  public id: string
  public type: string
  public defaultLocale: Locale
  public opts: RecordFileOptions

  constructor(uppy: Uppy, opts: RecordFileOptions) {
    super(uppy, {})
    this.id = 'RecordFile'
    this.type = 'modifier'

    this.defaultLocale = {
      strings: {
        compressingImages: 'Preparing for Upload...',
      },
    }

    this.opts = opts
    this.prepareUpload = this.prepareUpload.bind(this)
  }

  public prepareUpload(fileIDs: string[]) {
    for (let fileID of fileIDs) {
      const file = this.uppy.getFile(fileID)
      this.uppy.emit('preprocess-progress', file, {
        mode: 'indeterminate',
        message: 'Preparing Upload',
      })

      const item = this.opts.fileItems.get(file.name)

      if (item !== undefined) {
        this.uppy.setFileMeta(fileID, {
          wasabiPath: item.path,
        })
      }

      this.uppy.emit('preprocess-complete', file)
    }

    return Promise.resolve()
  }

  public install() {
    this.uppy.addPreProcessor(this.prepareUpload)
  }

  public uninstall() {
    this.uppy.removePreProcessor(this.prepareUpload)
  }
}
