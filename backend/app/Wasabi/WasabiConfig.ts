import Env from '@ioc:Adonis/Core/Env'
import { WasabiConfig } from 'App/types'

export function wasabiConfig(bucket: string): WasabiConfig {
  const config = {
    accessKeyId: Env.get('WASABI_ACCESS_KEY_ID'),
    secretAccessKey: Env.get('WASABI_SECRET_ACCESS_KEY'),
    region: 'us-west-1',
    bucket: bucket,
    endpoint: 'https://s3.us-west-1.wasabisys.com',
  }

  return config
}

export function wasabiConfigV3() {
  return {
    region: 'us-west-1',
    endpoint: 'https://s3.us-west-1.wasabisys.com',
    credentials: {
      accessKeyId: Env.get('WASABI_ACCESS_KEY_ID'),
      secretAccessKey: Env.get('WASABI_SECRET_ACCESS_KEY'),
    },
  }
}
