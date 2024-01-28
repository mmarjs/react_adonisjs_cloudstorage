import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TimeZone from 'App/Models/TimeZone'

export default class TimeZoneSeeder extends BaseSeeder {
  public async run() {
    const zones = [
      {
        local: 'PST',
        utc: -7,
      },
      {
        local: 'MST',
        utc: -6,
      },

      {
        local: 'CST',
        utc: -5,
      },

      {
        local: 'EST',
        utc: -4,
      },
    ]

    for (let zone of zones) {
      await TimeZone.create(zone)
    }
  }
}
