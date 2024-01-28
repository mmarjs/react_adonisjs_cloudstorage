import User from 'App/Models/User'
import ZipBuild from 'App/Models/ZipBuild'
import Logger from '@ioc:Adonis/Core/Logger'
import { DateTime } from 'luxon'

export default async function UpdateZipBuild(buildId: number, userId: number) {
  const user = await User.query()
    .select('id', 'first_name', 'last_name')
    .where('id', userId)
    .first()

  const build = await ZipBuild.find(buildId)

  if (build === null) {
    Logger.error(`Could not find build ${buildId} for user ${userId}`)
    return
  }

  build.downloadedAt = DateTime.local()
  build.downloadedBy = user?.fullName ?? `${userId}`
  await build.save()

  if (!build.$isPersisted) {
    Logger.error(`Could not update build ${buildId} for user ${userId}`)
  }
}
