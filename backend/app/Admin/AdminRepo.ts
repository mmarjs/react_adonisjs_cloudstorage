import cuid from 'cuid'
import Auth from 'App/Auth/Auth'
import Admin from 'App/Models/Admin'
import PasswordHasher from 'App/Auth/PasswordHasher'

export async function isValidPassword(admin: Admin, password: string): Promise<boolean> {
  const hasher = new PasswordHasher(password, admin.salt)
  const testHash = await hasher.hash()

  return testHash === admin.password
}

export async function impersonate(
  userId: number,
  companyId: number,
  timeout?: number
): Promise<string> {
  const auth = new Auth(cuid())

  if (timeout) {
    auth.setTimeout(timeout)
  }

  await auth.store(userId, companyId)

  return auth.getToken()
}
