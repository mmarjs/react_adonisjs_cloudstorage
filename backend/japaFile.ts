import 'reflect-metadata'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import sourceMapSupport from 'source-map-support'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function startHttpServer() {
  process.env.NODE_ENV = 'testing'
  const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
  process.env.PORT = String(await getPort())
  await new Ignitor(__dirname).httpServer().start()
}

function getTestFiles() {
  let userDefined = process.argv.slice(2)[0]
  if (!userDefined) {
    return 'app/**/*.spec.ts'
  }

  return `${userDefined.replace(/\.ts$|\.js$/, '')}.ts`
}
/**
 * Configure test runner
 */
configure({
  files: getTestFiles(),
  before: [startHttpServer],
  after: [],
})
