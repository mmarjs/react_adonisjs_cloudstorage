import Mailgen from 'mailgen'
// import Application from '@ioc:Adonis/Core/Application'

// const defaultPath = Application.makePath(`app/Mail/theme/default.html`)
// const actionPath = Application.makePath(`app/Mail/theme/action.html`)

var defaultMailer = new Mailgen({
  theme: 'default',
  product: {
    name: 'Evidence Locker',
    link: 'https://evidencelocker.com',
  },
})

var actionMailer = new Mailgen({
  theme: 'default',
  product: {
    name: 'Evidence Locker',
    link: 'https://evidencelocker.com',
  },
})

export { defaultMailer, actionMailer }
