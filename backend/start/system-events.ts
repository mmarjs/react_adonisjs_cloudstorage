import Event from '@ioc:Adonis/Core/Event'
import Logger from '@ioc:Adonis/Core/Logger'

Event.on('db:query', (query) => {
  //@ts-ignore
  if (query?.duration && query?.name) {
    const ms = query?.duration[1] / 1e6

    //@ts-ignore
    const message = `[Duration] ${query?.name} ${ms} ms`
    Logger.info(message)
  }
})
