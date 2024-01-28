/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import ParseDbUrl from 'App/Lib/ParseDbUrl'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const mysqlUrl = Env.get('MYSQL_URL')
const db = ParseDbUrl.parse(mysqlUrl)

const databaseConfig: DatabaseConfig = {
  /*
   |--------------------------------------------------------------------------
   | Connection
   |--------------------------------------------------------------------------
   |
   | The primary connection for making database queries across the application
   | You can use any key from the `connections` object defined in this same
   | file.
   |
   */
  connection: 'mysql',

  connections: {
    /*
     |--------------------------------------------------------------------------
     | MySQL config
     |--------------------------------------------------------------------------
     |
     | Configuration for MySQL database. Make sure to install the driver
     | from npm when using this connection
     |
     | npm i mysql
     |
     */
    mysql: {
      client: 'mysql',
      connection: {
        host: db.host,
        port: db.port,
        user: db.username,
        password: db.password,
        database: db.database,
      },
      pool: {
        min: 4,
        max: 20,
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: Env.get('DEBUG_QUERY', false),
    },
  },
}

export default databaseConfig
