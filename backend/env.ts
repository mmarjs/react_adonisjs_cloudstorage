/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

const universalRules = {
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  NODE_ENV: Env.schema.enum(['development', 'testing', 'staging', 'production'] as const),
  APP_KEY: Env.schema.string(),
  APP_URL: Env.schema.string(),
  APP_NAME: Env.schema.string(),

  FRONTEND_URL: Env.schema.string(),
  DOWNLOAD_URL: Env.schema.string(),
  SESSION_DRIVER: Env.schema.string(),
  HASH_DRIVER: Env.schema.enum(['bcrypt', 'argon']),
  LOGGER_TRANSPORT: Env.schema.string(),
  PASSWORD_PEPPER: Env.schema.string(),
  ALLOWED_ORIGINS: Env.schema.string(),

  MYSQL_URL: Env.schema.string(),
  LOCAL_REDIS_URL: Env.schema.string(),
  EVENTS_REDIS_URL: Env.schema.string(),
  JOBS_REDIS_URL: Env.schema.string(),

  SENTRY_DSN: Env.schema.string(),

  MAILGUN_BASE_URL: Env.schema.string(),
  MAILGUN_API_KEY: Env.schema.string(),

  UBER_CLIENT_ID: Env.schema.string(),
  UBER_CLIENT_SECRET: Env.schema.string(),

  WASABI_ACCOUNT_NO: Env.schema.number(),
  WASABI_USER: Env.schema.string(),
  WASABI_PASSWORD: Env.schema.string(),

  WASABI_ACCESS_KEY_ID: Env.schema.string(),
  WASABI_SECRET_ACCESS_KEY: Env.schema.string(),

  WASABI_EVIDENCE_BUCKET: Env.schema.string(),
  WASABI_WORKSPACE_BUCKET: Env.schema.string(),

  TMP_DIR: Env.schema.string(),

  SLACK_ERRORS_WEBHOOK: Env.schema.string(),
  SLACK_GENERAL_WEBHOOK: Env.schema.string(),

  PUSHER_APP_ID: Env.schema.string(),
  PUSHER_KEY: Env.schema.string(),
  PUSHER_SECRET: Env.schema.string(),
  PUSHER_CLUSER: Env.schema.string(),
  DEBUG_QUERY: Env.schema.boolean(),
}

let rules = { ...universalRules }

export default Env.rules(rules)
