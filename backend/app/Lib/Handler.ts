/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import Log from 'App/Lib/Log'
import Debug from 'debug'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }
  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */

    const debug = Debug('errors')

    if (error.code === 'E_VALIDATION_FAILURE') {
      debug(error.messages)

      return ctx.response.status(422).send(error.messages)
    }

    if (error.code === 'E_ROW_NOT_FOUND') {
      debug(`Row Not Found: ${error?.message}`)
      return ctx.response.badRequest({ error: 'row-not-found' })
    }

    if (error) {
      debug(error.message)

      return ctx.response
        .status(403)
        .send({ error: 'The request can not be fulfilled at this time', message: error.message })
    }

    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx)
  }

  public async report(error: any, _ctx: HttpContextContract) {
    if (!this.shouldReport(error)) {
      return
    }

    Log(error)
  }
}
