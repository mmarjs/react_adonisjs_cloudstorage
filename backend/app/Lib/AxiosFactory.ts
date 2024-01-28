import axios, { AxiosInstance } from 'axios'
import { AxiosAuthType } from 'App/types'

export default class AxiosFactory {
  public authType: AxiosAuthType
  public token: string

  constructor(authType: AxiosAuthType, token: string) {
    this.authType = authType
    this.token = token
  }

  public config(): object {
    if (this.authType === 'bearer') {
      return {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${this.token} `,
        },
      }
    }

    return {
      timeout: 10000,
      headers: {
        Token: this.token,
      },
    }
  }

  public getInstance(): AxiosInstance {
    return axios.create(this.config())
  }
}
