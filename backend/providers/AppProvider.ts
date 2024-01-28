import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  public register() {}

  public async boot() {
    // IoC container is ready
  }

  public async ready() {}

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
