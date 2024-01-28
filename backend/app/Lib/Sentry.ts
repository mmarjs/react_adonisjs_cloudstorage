import Env from '@ioc:Adonis/Core/Env'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: Env.get('NODE_ENV') === 'production' ? 0.4 : 0.1,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
})

export default Sentry
