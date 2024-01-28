import Pusher from 'pusher'
import Env from '@ioc:Adonis/Core/Env'

const appId = Env.get('PUSHER_APP_ID')
const key = Env.get('PUSHER_KEY')
const secret = Env.get('PUSHER_SECRET')
const cluster = Env.get('PUSHER_CLUSER')

export default new Pusher({ appId, key, secret, cluster, useTLS: true })
