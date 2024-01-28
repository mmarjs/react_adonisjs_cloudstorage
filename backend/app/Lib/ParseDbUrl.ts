interface DatabaseParams {
  host: string
  port: number
  username: string
  password: string
  database: string
}

export default class ParseDbUrl {
  public static parse(dbUrl: string): DatabaseParams {
    const parsed = new URL(dbUrl)

    return {
      host: parsed.hostname,
      port: Number(parsed.port),
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1),
    }
  }
}
