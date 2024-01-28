import { WebStorage } from 'redux-persist'
import { get, set, del } from 'idb-keyval'

export default class Storage implements WebStorage {
  public async getItem(key: string): Promise<string | null> {
    const res = await get(key)

    if (res === undefined) {
      return null
    }

    return res
  }

  public async setItem(key: string, item: string): Promise<void> {
    set(key, item)
  }

  public async removeItem(key: string): Promise<void> {
    del(key)
  }
}
