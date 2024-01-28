import { getExpiresDate, getSearchBody, getFileIconPath } from './common'
import { ShareDataItem, AdvancedSearchFilterItem } from './types'

describe('share form ExpiresDate', () => {
  it('returns ExpiresDate undefined', () => {
    const data: ShareDataItem = {
      email: 'test@gmail.com',
      password: 'testtest',
      subject: 'test',
      expires: 0,
    }
    expect(getExpiresDate(data)).toBe(undefined)
  })
  it('returns ExpiresDate string', () => {
    const data: ShareDataItem = {
      email: 'test@gmail.com',
      password: 'testtest',
      subject: 'test',
      expires: 4,
      date: '2021-09-03',
      time: '12:39',
    }
    expect(getExpiresDate(data)).toBe('2021-09-03T10:39:00.000Z')
  })
})

describe('Advanced SearchBody', () => {
  it('return access Private', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 0,
      name: '',
      owner: 0,
      sizecondition: 0,
      type: 'Any',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.access).toBe('private')
  })

  it('return category', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 0,
      name: '',
      owner: 0,
      sizecondition: 0,
      type: 'Any',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.access).toBe('private')
    expect(searchBody.category).toBe('workgroup')
  })

  it('return size', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 0,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'Any',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.size?.gt).toBe(true)
    expect(searchBody.size?.lt).toBe(false)
  })

  it('return exact modifiedDate', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 1,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'Any',
      firstdate: '2017-05-24',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.last_modified?.exactly).toBe('2017-05-24')
    expect(searchBody.last_modified?.after).toBe('')
    expect(searchBody.last_modified?.before).toBe('')
  })

  it('return before modifiedDate', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 2,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'Any',
      firstdate: '2017-05-24',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.last_modified?.exactly).toBe('')
    expect(searchBody.last_modified?.before).toBe('2017-05-24')
    expect(searchBody.last_modified?.after).toBe('')
  })

  it('return after modifiedDate', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 3,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'Any',
      firstdate: '2017-05-24',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.last_modified?.exactly).toBe('')
    expect(searchBody.last_modified?.before).toBe('')
    expect(searchBody.last_modified?.after).toBe('2017-05-24')
  })

  it('return between modifiedDate', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 4,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'Any',
      firstdate: '2017-05-24',
      seconddate: '2017-06-24',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.last_modified?.exactly).toBe('')
    expect(searchBody.last_modified?.between?.before).toBe('2017-05-24')
    expect(searchBody.last_modified?.between?.after).toBe('2017-06-24')
  })

  it('return file type without extension', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 4,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'MS Office',
      firstdate: '2017-05-24',
      seconddate: '2017-06-24',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.file_type?.category).toBe('MS Office')
  })

  it('return file type extension', () => {
    const data: AdvancedSearchFilterItem = {
      access: 1,
      location: 0,
      modifieddate: 4,
      name: '',
      owner: 0,
      sizecondition: 1,
      sizetype: 0,
      type: 'Extension',
      extension: '.exe',
      firstdate: '2017-05-24',
      seconddate: '2017-06-24',
    }
    const searchBody = getSearchBody(data, 1, 1, 0)
    expect(searchBody.file_type?.extension).toBe('.exe')
  })
})

describe('File TypeIcon Test', () => {
  it('return file path', () => {
    const fileIconPath: string = getFileIconPath('PNG')
    expect(fileIconPath).toBe('PNG_trans.svg')
  })

  it('return invalid file path', () => {
    const fileIconPath: string = getFileIconPath('PNGA')
    expect(fileIconPath).toBe('UNK_trans.svg')
  })
})
