export function errorMessage(key: string): string {
  const messages = new Map<string, string>()
  messages.set('no-such-account', 'Incorrect email or password. Please try again.')
  messages.set(
    'inactive-user',
    'Your account is currently inactive. Please contact the account owner or customer service'
  )
  messages.set(
    'unverified-user',
    'Your account is unverified. We have sent you an email to verify your email address. Please try to login again after verifying your account.'
  )
  messages.set(
    'no-roles',
    'There is an error with your account set up. Please reach out to customer service'
  )
  messages.set(
    'invalid-login-process-token',
    'Your login process has timed out. Please refresh the page and try again.'
  )
  messages.set(
    'invalid-two-factor',
    'Your two factor authentication code is invalid. Please try to login again'
  )
  messages.set('invalid-password', 'Invalid email or password. Please try again')
  messages.set('company-is-deleted', 'The company you are trying to sign is not available.')

  if (messages.has(key)) {
    return messages.get(key) as string
  }

  return 'You were not able to be logged in at this time. Please try again soon.'
}
