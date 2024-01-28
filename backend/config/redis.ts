/**
 * Config source: https://git.io/JemcF
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import ParseDbUrl from 'App/Lib/ParseDbUrl'
import { RedisConfig } from '@ioc:Adonis/Addons/Redis'

/*
|--------------------------------------------------------------------------
| Redis configuration
|--------------------------------------------------------------------------
|
| Following is the configuration used by the Redis provider to connect to
| the redis server and execute redis commands.
|
| Do make sure to pre-define the connections type inside `contracts/redis.ts`
| file for AdonisJs to recognize connections.
|
| Make sure to check `contracts/redis.ts` file for defining extra connections
*/

const localUrl = Env.get('LOCAL_REDIS_URL')
const eventsUrl = Env.get('EVENTS_REDIS_URL')
const jobsUrl = Env.get('JOBS_REDIS_URL')

const local = ParseDbUrl.parse(localUrl)
const events = ParseDbUrl.parse(eventsUrl)
const jobs = ParseDbUrl.parse(jobsUrl)

const redisConfig: RedisConfig = {
  connection: 'local',

  connections: {
    /*
    |--------------------------------------------------------------------------
    | The default connection
    |--------------------------------------------------------------------------
    |
    | The main connection you want to use to execute redis commands. The same
    | connection will be used by the session provider, if you rely on the
    | redis driver.
    |
    */
    local: {
      host: local.host,
      port: local.port,
      password: local.password,
      db: 0,
      keyPrefix: '',
    },
    jobs: {
      host: jobs.host,
      port: jobs.port,
      password: jobs.password,
      db: 1,
      keyPrefix: '',
    },
    events: {
      host: events.host,
      port: events.port,
      password: events.password,
      db: 2,
      keyPrefix: '',
    },
  },
}

export default redisConfig
