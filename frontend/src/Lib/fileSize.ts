import filesize from 'filesize'

export const displayFileSize = (size: number | undefined) => {
  return filesize(size ? size : 0)
}

export const displayGigCount = (size: number | undefined) => {
  if ((size && size < 1024) || size === null || size === 0) {
    return filesize(size, { output: 'array', exponent: 1 })
  }
  return filesize(size ? size : 0, { output: 'array' })
}
