import MiniSearch, { SearchResult } from 'minisearch'
import { ShowUserInfo } from 'types'

export default class UserSearch {
  public searchTerms: string = ''
  private minisearch?: MiniSearch
  private users: ShowUserInfo[] = []

  constructor(searchTerms: string, users: ShowUserInfo[]) {
    this.searchTerms = searchTerms.trim()
    this.users = users
  }

  public search() {
    this.minisearch = new MiniSearch({
      fields: ['first_name', 'last_name', 'company_name'],
      storeFields: [
        'id',
        'email',
        'role',
        'first_name',
        'last_name',
        'status',
        'company_name',
        'last_login',
      ],
      searchOptions: {
        prefix: true,
      },
    })

    this.minisearch.addAll(this.users)

    const results = this.minisearch.search(this.searchTerms, {
      fields: ['first_name', 'last_name', 'company_name'],
    })

    const users = this.toUsers(results)
    const sorted = this.sort(users)

    return sorted
  }

  private toUsers(results: SearchResult[]): ShowUserInfo[] {
    return results.map((r) => {
      const info: ShowUserInfo = {
        id: r['id'],
        email: r['email'],
        role: r['role'],
        first_name: r['first_name'],
        last_name: r['last_name'],
        status: r['status'],
        company_name: r['company_name'],
        last_login: r['last_login'] ?? null,
        created_at: r['created_at'] ?? null,
      }
      return info
    })
  }

  private sort(users: ShowUserInfo[]): ShowUserInfo[] {
    return users.sort((a, b) => {
      if (a.role > b.role) {
        return 1
      }

      if (a.role < b.role) {
        return -1
      }

      if (a.last_name > b.last_name) {
        return 1
      }
      if (a.last_name < b.last_name) {
        return -1
      }

      return 0
    })
  }
}
