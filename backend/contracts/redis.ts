/**
 * Contract source: https://git.io/JemcN
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

declare module '@ioc:Adonis/Addons/Redis' {
  interface RedisConnectionsList {
    local: RedisConnectionConfig
    jobs: RedisConnectionConfig
    events: RedisConnectionConfig
  }

  function get(key: string)
  function set(key: string, value: string | number, ex: string, timeout: number)
  function exists(key: string)
  function expire(key: string, timeout: number)
  function del(key: string)
}
