import Sentry from 'App/Lib/Sentry'
import Logger from '@ioc:Adonis/Core/Logger'

export default function Log(err: Error, msg?: string): void {
  Sentry.captureException(err)
  Logger.error(err?.message)

  if (msg) {
    Sentry.captureMessage(msg)
    Logger.error(msg)
  }
}
