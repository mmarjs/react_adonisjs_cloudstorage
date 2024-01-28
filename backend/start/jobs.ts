import execa from 'execa'
import Application from '@ioc:Adonis/Core/Application'

if (Application.nodeEnvironment !== 'testing') {
  execa
    .node('ace', ['jobs:run'], {
      stdio: 'inherit',
    })
    .then((val) => {
      console.log(val)
    })
}
