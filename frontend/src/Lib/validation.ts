export function has(object: object, prop: string) {
  return object.hasOwnProperty(prop)
}

export function isFieldError(error: string | undefined): boolean {
  if (error === undefined) {
    return false
  }

  return true
}
