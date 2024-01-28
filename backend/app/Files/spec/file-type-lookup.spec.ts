import test from 'japa'
import FileType from 'App/Models/FileType'
import FileTypeLookup from 'App/Files/FileTypeLookup'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('File Type Lookup', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getExtension returns file extension', async (assert) => {
    const filename = 'foo.docx'
    const lookup = new FileTypeLookup(filename)
    const result = lookup.getExtension()

    assert.equal(result, 'docx')
  })

  test('getExtension with no ending returns filename', async (assert) => {
    const filename = 'foo'
    const lookup = new FileTypeLookup(filename)
    const result = lookup.getExtension()

    assert.equal(result, 'foo')
  })

  test('getExtension with complicated file name returns extension', async (assert) => {
    const filename = 'foo.bar.baz.bat.foo.mp4'
    const lookup = new FileTypeLookup(filename)
    const result = lookup.getExtension()

    assert.equal(result, 'mp4')
  })

  test('finds a known file type and returns id', async (assert) => {
    const filename = 'foo.docx'
    const lookup = new FileTypeLookup(filename)
    const result = await lookup.findType()

    const fileType = await FileType.findOrFail(result)
    assert.equal(fileType.name, 'MS Word')
  })

  test('returns unknown file id for unknown file type', async (assert) => {
    const filename = 'foo.abc'
    const lookup = new FileTypeLookup(filename)
    const result = await lookup.findType()

    const fileType = await FileType.findOrFail(result)
    assert.equal(fileType.name, 'Unknown')
  })
})
