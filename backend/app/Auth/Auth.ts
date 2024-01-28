import cuid from 'cuid'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import ShareLink from 'App/Models/ShareLink'
import Redis from '@ioc:Adonis/Addons/Redis'
import Log from 'App/Lib/Log'
import Logger from '@ioc:Adonis/Core/Logger'
import { AuthToken } from 'App/types'
import Debug from 'debug'
import { produce } from 'immer'

const debug = Debug('auth')

export default class Auth {
  private token: string
  private timeout: number = 3600

  constructor(token: string = '') {
    this.token = token
  }

  public getToken(): string {
    return this.token
  }

  public setTimeout(timeout: number) {
    this.timeout = timeout
  }

  public async makeAuthToken(userId: number, companyId: number): Promise<string> {
    const token = cuid()
    await this.store(userId, companyId)

    return token
  }

  public async store(userId: number, companyId: number, shareLinkId?: number): Promise<boolean> {
    try {
      const data: AuthToken = {
        userId,
        companyId,
        shareLinkId,
      }
      const serialized = JSON.stringify(data)

      const res = await Redis.set(this.token, serialized, 'ex', this.timeout)

      if (res === 'OK') {
        return true
      } else {
        return false
      }
    } catch (err) {
      Log(err)
      return false
    }
  }

  public async fetch(): Promise<AuthToken> {
    const res = await Redis.get(this.token)

    if (res === null) {
      throw new Error('cannot-fetch-token')
    }

    return JSON.parse(res) as AuthToken
  }

  public async check(): Promise<boolean> {
    debug('fetching token to check status')
    const data = await this.fetch()

    debug('fetching user')
    const user = await User.find(data.userId)

    if (user === null || user.id !== data.userId) {
      debug('user does not exist')
      return false
    }

    return true
  }

  public async isAboutToExpire(): Promise<boolean> {
    const ttl = await Redis.ttl(this.token)

    return ttl < 1200 ? true : false
  }

  public async refreshTtl(): Promise<void> {
    try {
      const data = await this.fetch()
      const firstTtl = await Redis.ttl(this.token)
      await Redis.expire(this.token, this.timeout)
      const secondTtl = await Redis.ttl(this.token)
      Logger.info(
        `Token Refresh of ${this.token} for user ${data.userId} at company ${data.companyId}. Initial ttl was ${firstTtl}. Refreshed ttl is ${secondTtl}.`
      )
    } catch (err) {
      Log(err)
    }
  }

  public async delete(): Promise<boolean> {
    try {
      const value = await Redis.del(this.token)
      return value === 1 ? true : false
    } catch (err) {
      Log(err)
      return false
    }
  }

  public async getUser(): Promise<User> {
    const data = await this.fetch()

    return await User.findOrFail(data.userId)
  }

  public async getCompany(): Promise<Company> {
    const data = await this.fetch()

    return await Company.findOrFail(data.companyId)
  }

  public async switchCompany(companyId: number): Promise<boolean> {
    try {
      const data = await this.fetch()

      const next = produce(data, (draft) => {
        draft.userId = data.userId
        draft.companyId = companyId
        if (draft.shareLinkId) {
          draft.shareLinkId = data.shareLinkId
        }
      })
      const serialized = JSON.stringify(next)

      const res = await Redis.set(this.token, serialized, 'ex', this.timeout)

      if (res === 'OK') {
        return true
      } else {
        return false
      }
    } catch (err) {
      Log(err)
      return false
    }
  }

  public async getShareLink(): Promise<ShareLink> {
    const data = await this.fetch()

    return await ShareLink.findOrFail(data?.shareLinkId)
  }

  public async makeLoginProcessToken(id: number) {
    try {
      const loginProcessToken = cuid()

      const res = await Redis.set(loginProcessToken, id, 'ex', 400)

      if (res === 'OK') {
        return loginProcessToken
      } else {
        return null
      }
    } catch (err) {
      Log(err)
      return null
    }
  }

  public async isValidLoginProcessToken(token: string) {
    const res = (await Redis.get(token)) as number | null

    if (res === null) {
      return false
    }

    const user = await User.find(res)

    if (user === null) {
      return false
    }

    return true
  }

  public async deleteLoginProcessToken(token: string) {
    try {
      const value = await Redis.del(token)
      return value === 1 ? true : false
    } catch (err) {
      Log(err)
      return false
    }
  }
}
