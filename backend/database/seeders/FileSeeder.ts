import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import FileType from 'App/Models/FileType'
import FileVariant from 'App/Models/FileVariant'
import FileCategory from 'App/Models/FileCategory'

export default class FileSeederSeeder extends BaseSeeder {
  public async run() {
    await this.msOffice()
    await this.music()
    await this.video()
    await this.photo()
    await this.adobe()
    await this.generic()
  }

  private async msOffice() {
    const category = await FileCategory.create({
      category: 'MS Office',
    })

    const word = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS Word',
      mime: 'application/msword',
    })

    await FileVariant.createMany([
      { fileTypeId: word.id, ext: 'doc' },
      { fileTypeId: word.id, ext: 'docm' },
      { fileTypeId: word.id, ext: 'doct' },
      { fileTypeId: word.id, ext: 'docx' },
      { fileTypeId: word.id, ext: 'dot' },
      { fileTypeId: word.id, ext: 'dotx' },
      { fileTypeId: word.id, ext: 'w6w' },
      { fileTypeId: word.id, ext: 'wiz' },
    ])

    const excel = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS Excel',
      mime: 'application/vnd.ms-excel',
    })

    await FileVariant.createMany([
      { fileTypeId: excel.id, ext: 'xla' },
      { fileTypeId: excel.id, ext: 'xlam' },
      { fileTypeId: excel.id, ext: 'xlb' },
      { fileTypeId: excel.id, ext: 'xlc' },
      { fileTypeId: excel.id, ext: 'xlm' },
      { fileTypeId: excel.id, ext: 'xls' },
      { fileTypeId: excel.id, ext: 'xlsb' },
      { fileTypeId: excel.id, ext: 'xlsm' },
      { fileTypeId: excel.id, ext: 'xlt' },
      { fileTypeId: excel.id, ext: 'xltm' },
      { fileTypeId: excel.id, ext: 'xltx' },
      { fileTypeId: excel.id, ext: 'xlw' },
    ])

    const powerPoint = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS Power Point',
      mime: 'application/vnd.ms-powerpoint',
    })

    await FileVariant.createMany([
      { fileTypeId: powerPoint.id, ext: 'pot' },
      { fileTypeId: powerPoint.id, ext: 'potm' },
      { fileTypeId: powerPoint.id, ext: 'ppa' },
      { fileTypeId: powerPoint.id, ext: 'ppam' },
      { fileTypeId: powerPoint.id, ext: 'pps' },
      { fileTypeId: powerPoint.id, ext: 'ppt' },
      { fileTypeId: powerPoint.id, ext: 'pptx' },
      { fileTypeId: powerPoint.id, ext: 'pwz' },
    ])

    const oneNote = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS One Note',
      mime: 'application/onenote',
    })

    await FileVariant.createMany([
      { fileTypeId: oneNote.id, ext: 'onepkg' },
      { fileTypeId: oneNote.id, ext: 'onetmp' },
      { fileTypeId: oneNote.id, ext: 'onetoc' },
      { fileTypeId: oneNote.id, ext: 'onetoc' },
      { fileTypeId: oneNote.id, ext: 'one' },
    ])

    const outlook = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS Outlook',
      mime: 'application/vnd.ms-outlook',
    })

    await FileVariant.createMany([
      { fileTypeId: outlook.id, ext: 'msg' },
      { fileTypeId: outlook.id, ext: 'pst' },
      { fileTypeId: outlook.id, ext: 'pab' },
      { fileTypeId: outlook.id, ext: 'ost' },
    ])

    const publisher = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS Publisher',
      mime: 'application/x-mspublisher',
    })

    await FileVariant.createMany([{ fileTypeId: publisher.id, ext: 'pub' }])

    const access = await FileType.create({
      fileCategoryId: category.id,
      name: 'MS Access',
      mime: 'application/x-msacces',
    })

    await FileVariant.createMany([{ fileTypeId: access.id, ext: 'mdb' }])
  }

  private async music() {
    const category = await FileCategory.create({
      category: 'Music',
    })

    const aac = await FileType.create({
      fileCategoryId: category.id,
      name: 'AAC',
      mime: 'audio/x-aac',
    })

    await FileVariant.createMany([{ fileTypeId: aac.id, ext: 'aac' }])

    const aiff = await FileType.create({
      fileCategoryId: category.id,
      name: 'AAIF',
      mime: 'audio/mpeg',
    })

    await FileVariant.createMany([
      { fileTypeId: aiff.id, ext: 'aif' },
      { fileTypeId: aiff.id, ext: 'aifc' },
      { fileTypeId: aiff.id, ext: 'aiff' },
    ])

    const flac = await FileType.create({
      fileCategoryId: category.id,
      name: 'FLAC',
      mime: 'audio/flac',
    })

    await FileVariant.create({ fileTypeId: flac.id, ext: 'flac' })

    const mp3 = await FileType.create({
      fileCategoryId: category.id,
      name: 'MP3',
      mime: 'audio/mpeg',
    })

    await FileVariant.create({ fileTypeId: mp3.id, ext: 'mp3' })

    const mpa = await FileType.create({
      fileCategoryId: category.id,
      name: 'MPA',
      mime: 'audio/mpeg',
    })

    await FileVariant.create({ fileTypeId: mpa.id, ext: 'mpa' })

    const ogg = await FileType.create({
      fileCategoryId: category.id,
      name: 'OGG',
      mime: 'audio/ogg',
    })

    await FileVariant.createMany([
      { fileTypeId: ogg.id, ext: 'oga' },
      { fileTypeId: ogg.id, ext: 'ogg' },
    ])

    const wav = await FileType.create({
      fileCategoryId: category.id,
      name: 'Audio Wav',
      mime: 'audio/wav',
    })

    await FileVariant.create({ fileTypeId: wav.id, ext: 'wav' })

    const wma = await FileType.create({
      fileCategoryId: category.id,
      name: 'WMA Audio',
      mime: 'audio/x-ms-wma',
    })

    await FileVariant.create({ fileTypeId: wma.id, ext: 'wma' })
  }

  private async video() {
    const category = await FileCategory.create({
      category: 'Video',
    })

    const gggp = await FileType.create({
      fileCategoryId: category.id,
      name: '3GP',
      mime: 'video/3gp',
    })

    await FileVariant.create({ fileTypeId: gggp.id, ext: '3gp' })

    const avi = await FileType.create({
      fileCategoryId: category.id,
      name: 'AVI',
      mime: 'video/msvideo',
    })

    await FileVariant.create({ fileTypeId: avi.id, ext: 'avi' })

    const dv = await FileType.create({
      fileCategoryId: category.id,
      name: 'DV',
      mime: 'video/msvideo',
    })

    await FileVariant.create({ fileTypeId: dv.id, ext: 'dv' })

    const flv = await FileType.create({
      fileCategoryId: category.id,
      name: 'FLV',
      mime: 'video/x-flv',
    })

    await FileVariant.create({ fileTypeId: flv.id, ext: 'flv' })

    const h261 = await FileType.create({
      fileCategoryId: category.id,
      name: 'H.261',
      mime: 'video/h261',
    })

    await FileVariant.create({ fileTypeId: h261.id, ext: 'h261' })

    const h263 = await FileType.create({
      fileCategoryId: category.id,
      name: 'H.263',
      mime: 'video/h263',
    })

    await FileVariant.create({ fileTypeId: h263.id, ext: 'h263' })

    const h264 = await FileType.create({
      fileCategoryId: category.id,
      name: 'H.264',
      mime: 'video/h264',
    })

    await FileVariant.create({ fileTypeId: h264.id, ext: 'h264' })

    const m1v = await FileType.create({
      fileCategoryId: category.id,
      name: 'M1V',
      mime: 'video/mpeg',
    })

    await FileVariant.create({ fileTypeId: m1v.id, ext: 'm1v' })

    const m2v = await FileType.create({
      fileCategoryId: category.id,
      name: 'M2V',
      mime: 'video/mpeg',
    })

    await FileVariant.create({ fileTypeId: m2v.id, ext: 'm2v' })

    const m4v = await FileType.create({
      fileCategoryId: category.id,
      name: 'M4V',
      mime: 'video/x-m4v',
    })

    await FileVariant.create({ fileTypeId: m4v.id, ext: 'm4v' })

    const mov = await FileType.create({
      fileCategoryId: category.id,
      name: 'MOV',
      mime: 'video/quicktime',
    })

    await FileVariant.create({ fileTypeId: mov.id, ext: 'mov' })

    const mp2 = await FileType.create({
      fileCategoryId: category.id,
      name: 'MP2',
      mime: 'video/mpeg',
    })

    await FileVariant.create({ fileTypeId: mp2.id, ext: 'mp2' })

    const mp4 = await FileType.create({
      fileCategoryId: category.id,
      name: 'MP4',
      mime: 'video/mpeg',
    })

    await FileVariant.create({ fileTypeId: mp4.id, ext: 'mp4' })

    const mpa = await FileType.create({
      fileCategoryId: category.id,
      name: 'MPA',
      mime: 'video/mpeg',
    })

    await FileVariant.create({ fileTypeId: mpa.id, ext: 'mpa' })

    const mpeg = await FileType.create({
      fileCategoryId: category.id,
      name: 'MPEG',
      mime: 'video/mpeg',
    })

    await FileVariant.create({ fileTypeId: mpeg.id, ext: 'mpeg' })

    const qt = await FileType.create({
      fileCategoryId: category.id,
      name: 'MPEG',
      mime: 'video/quicktime',
    })

    await FileVariant.create({ fileTypeId: qt.id, ext: 'qt' })

    const rv = await FileType.create({
      fileCategoryId: category.id,
      name: 'Real Video',
      mime: 'video/vnd.rn-realvideo',
    })

    await FileVariant.create({ fileTypeId: rv.id, ext: 'rv' })
  }

  private async photo() {
    const category = await FileCategory.create({
      category: 'Photo',
    })

    const gif = await FileType.create({
      fileCategoryId: category.id,
      name: 'GIF',
      mime: 'image/gif',
    })

    await FileVariant.create({ fileTypeId: gif.id, ext: 'gif' })

    const icon = await FileType.create({
      fileCategoryId: category.id,
      name: 'ICO',
      mime: 'image/x-icon',
    })

    await FileVariant.create({ fileTypeId: icon.id, ext: 'ico' })

    const jpeg = await FileType.create({
      fileCategoryId: category.id,
      name: 'JPEG',
      mime: 'image/jpeg',
    })

    await FileVariant.createMany([
      { fileTypeId: jpeg.id, ext: 'jpe' },
      { fileTypeId: jpeg.id, ext: 'jpeg' },
      { fileTypeId: jpeg.id, ext: 'jpg' },
    ])

    const png = await FileType.create({
      fileCategoryId: category.id,
      name: 'PNG',
      mime: 'image/png',
    })

    await FileVariant.create({ fileTypeId: png.id, ext: 'png' })

    const psd = await FileType.create({
      fileCategoryId: category.id,
      name: 'PSD',
      mime: 'image/vnd.adobe.photoshop',
    })

    await FileVariant.create({ fileTypeId: psd.id, ext: 'psd' })

    const svg = await FileType.create({
      fileCategoryId: category.id,
      name: 'SVG',
      mime: 'image/svg+xml',
    })

    await FileVariant.createMany([
      { fileTypeId: svg.id, ext: 'svg' },
      { fileTypeId: svg.id, ext: 'svgz' },
    ])

    const tiff = await FileType.create({
      fileCategoryId: category.id,
      name: 'TIFF',
      mime: 'image/tiff',
    })

    await FileVariant.createMany([
      { fileTypeId: tiff.id, ext: 'tif' },
      { fileTypeId: tiff.id, ext: 'tiff' },
    ])

    const bitmap = await FileType.create({
      fileCategoryId: category.id,
      name: 'Bitmap',
      mime: 'image/x-xbitmap',
    })

    await FileVariant.create({ fileTypeId: bitmap.id, ext: 'xmb' })
  }

  private async adobe() {
    const category = await FileCategory.create({
      category: 'Adobe',
    })

    const pdf = await FileType.create({
      fileCategoryId: category.id,
      name: 'PDF',
      mime: 'application/pdf',
    })

    await FileVariant.create({ fileTypeId: pdf.id, ext: 'pdf' })
  }

  private async generic() {
    const category = await FileCategory.create({
      category: 'Generic',
    })

    const encase = await FileType.create({
      fileCategoryId: category.id,
      name: 'Encase Image',
      mime: 'application/octet-stream',
    })

    await FileVariant.create({ fileTypeId: encase.id, ext: 'EO1' })

    const unkown = await FileType.create({
      fileCategoryId: category.id,
      name: 'Unknown',
      mime: 'application/octet-stream',
    })

    await FileVariant.create({ fileTypeId: unkown.id, ext: 'none' })

    const zip = await FileType.create({
      fileCategoryId: category.id,
      name: 'Zip',
      mime: 'application/zip',
    })

    await FileVariant.create({ fileTypeId: zip.id, ext: 'zip' })

    const text = await FileType.create({
      fileCategoryId: category.id,
      name: 'Text file',
      mime: 'text/plain',
    })

    await FileVariant.createMany([
      { fileTypeId: text.id, ext: 'txt' },
      { fileTypeId: text.id, ext: 'conf' },
      { fileTypeId: text.id, ext: 'diff' },
      { fileTypeId: text.id, ext: 'in' },
      { fileTypeId: text.id, ext: 'log' },
      { fileTypeId: text.id, ext: 'text' },
      { fileTypeId: text.id, ext: 'md' },
      { fileTypeId: text.id, ext: 'markdown' },
    ])
  }
}
