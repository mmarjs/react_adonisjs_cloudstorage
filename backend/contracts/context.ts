declare module '@ioc:Adonis/Core/HttpContext' {
  interface HttpContextContract {
    token: string | undefined
  }
}
