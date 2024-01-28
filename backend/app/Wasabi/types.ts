export interface WasabiConfig {
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  endpoint: string
}

export type WasabiUser = 'writer' | 'reader'

export interface WasabiLocation {
  bucket: string
  path: string
}

export interface WasabiUploadUrl {
  url: string
  fields: {
    'key': string
    'bucket': string
    'X-Amz-Algorithm': string
    'X-Amz-Credential': string
    'X-Amz-Date': string
    'Policy': string
    'X-Amz-Signature': string
  }
}

export interface WasabiTemporaryCredentials {
  AccessKeyId: string
  SecretAccessKey: string
  Expires: string
  Bucket: string
}
