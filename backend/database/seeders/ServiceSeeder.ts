import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Service from 'App/Models/Service'
import ServiceItem from 'App/Models/ServiceItem'

interface ServiceSeeds {
  name: string
  filterable: boolean
  active: boolean
  type: 'api' | 'upload'
  items?: ServiceItemSeeds[]
}

interface ServiceItemSeeds {
  name: string
  description: string
  active?: true
}

export default class ServiceSeeder extends BaseSeeder {
  public async run() {
    for (let service of this.services()) {
      let instance = await Service.create(service)

      if (service?.items) {
        for (let item of service.items) {
          let serviceItem = new ServiceItem()
          serviceItem.name = item.name
          serviceItem.description = item.description

          if (item?.active === true) {
            serviceItem.active = true
          }

          await instance.related('items').save(serviceItem)
        }
      }
    }
  }

  public services(): ServiceSeeds[] {
    return [
      { name: 'Dropbox', active: false, filterable: false, type: 'api' },
      { name: 'Twitter', active: false, filterable: false, type: 'api' },
      {
        name: 'Google',
        active: false,
        filterable: true,
        type: 'api',
        items: this.googleServiceItems(),
      },
      {
        name: 'Microsoft',
        active: false,
        filterable: true,
        type: 'api',
        items: this.microsoftServiceItems(),
      },
      { name: 'Facebook', active: false, filterable: false, type: 'api' },
      { name: 'Instagram', active: false, filterable: false, type: 'api' },
      {
        name: 'Uber',
        active: true,
        filterable: false,
        type: 'api',
        items: this.uberServiceItems(),
      },
      {
        name: 'Lyft',
        active: false,
        filterable: false,
        type: 'api',
        items: this.lyftServiceItems(),
      },
      {
        name: 'Cloud Account',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.cloudAccountServiceItems(),
      },
      {
        name: 'Computer',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.computerServiceItems(),
      },
      {
        name: 'Email',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.emailServiceItems(),
      },
      {
        name: 'Mobile',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.mobileServiceItems(),
      },
      {
        name: 'Network Share',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.networkShareServiceItems(),
      },
      {
        name: 'Server',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.serverServiceItems(),
      },
      {
        name: 'USB Device',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.usbDeviceServiceItems(),
      },
      {
        name: 'Other',
        active: true,
        filterable: false,
        type: 'upload',
        items: this.otherServiceItems(),
      },
    ]
  }

  public googleServiceItems(): ServiceItemSeeds[] {
    return [
      {
        name: 'Gmail Messages',
        description: 'Emails & Attachments',
      },
      {
        name: 'Google Calendar',
        description: 'Calendar Items',
      },
      {
        name: 'Google Contacts',
        description: 'Contacts',
      },
      {
        name: 'Google Drive Files',
        description: 'Cloud Storage Files',
      },
      {
        name: 'Google Photos',
        description: 'Photos and Videos',
      },
      {
        name: 'Google Activity',
        description: 'Google searches, map queries & locations',
      },
      {
        name: 'Google Recent Devices',
        description: 'Devices connected to Google Account',
      },
      {
        name: 'Google Passwords/Tokens',
        description: 'Current Passwords & Tokens',
      },
    ]
  }

  public uberServiceItems(): ServiceItemSeeds[] {
    return [
      {
        name: 'Uber Account Information',
        description: 'Account Information',
        active: true,
      },
      {
        name: 'Uber Trip History',
        description: 'Uber Trip History',
        active: true,
      },
    ]
  }

  public lyftServiceItems(): ServiceItemSeeds[] {
    return [
      {
        name: 'Lyft Rides',
        description: 'Lyft Rides',
      },
    ]
  }

  public microsoftServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Microsoft Mail', description: 'Microsoft Mail' }]
  }

  public cloudAccountServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Cloud Account', description: 'Forensic account collection', active: true }]
  }

  public computerServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Computer', description: 'Forensic computer image', active: true }]
  }

  public emailServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Email', description: 'Forensic email account', active: true }]
  }

  public mobileServiceItems(): ServiceItemSeeds[] {
    return [
      { name: 'Mobile Device', description: 'Forensically mobile device image', active: true },
    ]
  }

  public networkShareServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Network Share', description: 'Network Share Image', active: true }]
  }

  public serverServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Server', description: 'Server image', active: true }]
  }

  public usbDeviceServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'USB Device', description: 'USB Device', active: true }]
  }

  public otherServiceItems(): ServiceItemSeeds[] {
    return [{ name: 'Other', description: 'Other forensic image', active: true }]
  }
}
